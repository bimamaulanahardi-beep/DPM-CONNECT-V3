import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const izin = await prisma.izinKegiatan.findFirst({
      where: {
        OR: [
          { id: params.id },
          { kode: params.id }
        ]
      },
      include: { timeline: { orderBy: { tanggal: 'asc' } } },
    });
    if (!izin) return NextResponse.json({ error: 'Permohonan izin tidak ditemukan' }, { status: 404 });
    return NextResponse.json(izin);
  } catch (error) {
    console.error('Error fetching izin:', error);
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as any;
    
    // Khusus Ketua DPM, Pimpinan, atau Admin
    const isAuthorized = 
      user.role === 'pimpinan' || 
      user.role === 'admin' || 
      (user.jabatan && user.jabatan.toLowerCase().includes('ketua'));

    if (!isAuthorized) {
      return NextResponse.json({ 
        error: 'Akses Ditolak: Hanya Ketua DPM atau Pimpinan yang berwenang menyetujui atau menolak permohonan izin kegiatan.' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { status, catatan_dpm } = body;
    const tanggal = new Date().toISOString().split('T')[0];

    const keteranganMap: Record<string, string> = {
      disetujui: 'Permohonan izin kegiatan telah DISETUJUI oleh Ketua DPM ITB Riau.',
      ditolak: 'Permohonan izin kegiatan DITOLAK oleh Ketua DPM ITB Riau.',
      perlu_revisi: 'Permohonan memerlukan revisi sebelum dapat disetujui.',
    };

    const targetIzin = await prisma.izinKegiatan.findFirst({
      where: {
        OR: [
          { id: params.id },
          { kode: params.id }
        ]
      }
    });

    if (!targetIzin) {
      return NextResponse.json({ error: 'Data izin tidak ditemukan' }, { status: 404 });
    }

    const updated = await prisma.izinKegiatan.update({
      where: { id: targetIzin.id },
      data: {
        status,
        catatan_dpm: catatan_dpm || null,
        diproses_oleh: `${user.name} (${user.jabatan || 'Ketua DPM'})`,
        tanggal_diproses: tanggal,
        timeline: {
          create: {
            status,
            keterangan: catatan_dpm || keteranganMap[status] || `Status diubah menjadi ${status}`,
            tanggal,
            petugas: `${user.name} (${user.jabatan || 'Ketua DPM'})`,
          }
        }
      },
      include: { timeline: { orderBy: { tanggal: 'asc' } } }
    });

    // Kirim email notifikasi ke pengaju
    if (updated.email_pj) {
      try {
        const { sendEmail } = await import('@/lib/mailer');
        const statusLabel = status === 'disetujui' ? '✅ DISETUJUI' : status === 'ditolak' ? '❌ DITOLAK' : '📝 PERLU REVISI';
        await sendEmail({
          to: updated.email_pj,
          subject: `[DPM ITB Riau] Update Izin: ${updated.nama_kegiatan} — ${statusLabel}`,
          html: `
            <h2>Update Status Permohonan Izin Kegiatan</h2>
            <p>Halo ${updated.penanggung_jawab},</p>
            <p>Permohonan izin kegiatan <strong>"${updated.nama_kegiatan}"</strong> Anda telah ditinjau dengan status: <strong>${statusLabel}</strong></p>
            ${catatan_dpm ? `<p><strong>Catatan dari Ketua DPM:</strong> ${catatan_dpm}</p>` : ''}
            <br/><p>Salam,<br/>DPM ITB Riau</p>
          `
        });
      } catch (e) {
        console.error('Email error (non-critical):', e);
      }
    }

    // Kirim notifikasi WhatsApp ke Penanggung Jawab
    if (updated.no_hp_pj) {
      try {
        const { sendWhatsApp } = await import('@/lib/whatsapp');
        const statusLabel = status === 'disetujui' ? 'DISETUJUI ✅' : status === 'ditolak' ? 'DITOLAK ❌' : 'PERLU REVISI 📝';
        await sendWhatsApp({
          to: updated.no_hp_pj,
          message: `*DPM ITB RIAU — Update Izin Kegiatan*\n\nHalo ${updated.penanggung_jawab},\nPermohonan izin kegiatan *"${updated.nama_kegiatan}"* (Kode: ${updated.kode}) telah ditinjau oleh Ketua DPM dengan status:\n\n*Status:* ${statusLabel}\n${catatan_dpm ? `*Catatan Ketua DPM:* ${catatan_dpm}\n` : ''}\nDiproses oleh: ${updated.diproses_oleh}\n\nTerima kasih.`
        });
      } catch (e) {
        console.error('WA notification error:', e);
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH izin error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user = session.user as any;
    if (user.role !== 'admin' && user.role !== 'pimpinan') {
      return NextResponse.json({ error: 'Akses Ditolak: Hanya Admin atau Pimpinan yang dapat menghapus data ini.' }, { status: 403 });
    }

    const targetIzin = await prisma.izinKegiatan.findFirst({
      where: {
        OR: [
          { id: params.id },
          { kode: params.id }
        ]
      }
    });

    if (!targetIzin) {
      return NextResponse.json({ error: 'Data izin tidak ditemukan' }, { status: 404 });
    }

    await prisma.izinKegiatan.delete({ where: { id: targetIzin.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus' }, { status: 500 });
  }
}
