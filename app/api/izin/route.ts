import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createInAppNotification } from '@/lib/notification';

export const dynamic = 'force-dynamic';

// GET — list semua izin (untuk DPM)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const list = await prisma.izinKegiatan.findMany({
      include: { timeline: { orderBy: { tanggal: 'asc' } } },
      orderBy: { tanggal_diajukan: 'desc' },
    });

    return NextResponse.json(list);
  } catch (error) {
    console.error('Error fetching izin kegiatan:', error);
    return NextResponse.json({ error: 'Gagal memuat data' }, { status: 500 });
  }
}

// POST — pengajuan izin baru (publik, tanpa login)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nama_kegiatan, penyelenggara, penanggung_jawab, no_hp_pj,
      email_pj, tanggal_mulai, tanggal_selesai, waktu_mulai,
      waktu_selesai, lokasi, deskripsi, estimasi_peserta, lampiran
    } = body;

    if (!nama_kegiatan || !penyelenggara || !penanggung_jawab || !no_hp_pj || !tanggal_mulai || !lokasi || !deskripsi) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const kode = `IZN-${Date.now().toString(36).toUpperCase()}`;
    const tanggal = new Date().toISOString().split('T')[0];

    const newIzin = await prisma.izinKegiatan.create({
      data: {
        kode,
        nama_kegiatan,
        penyelenggara,
        penanggung_jawab,
        no_hp_pj,
        email_pj: email_pj || null,
        tanggal_mulai,
        tanggal_selesai: tanggal_selesai || tanggal_mulai,
        waktu_mulai,
        waktu_selesai: waktu_selesai || '',
        lokasi,
        deskripsi,
        estimasi_peserta: parseInt(estimasi_peserta) || 0,
        status: 'menunggu',
        tanggal_diajukan: tanggal,
        lampiran: lampiran || null,
        timeline: {
          create: {
            status: 'menunggu',
            keterangan: 'Permohonan izin kegiatan berhasil dikirim dan sedang menunggu tinjauan DPM.',
            tanggal,
          }
        }
      },
      include: { timeline: true }
    });

    await createInAppNotification({
      judul: 'Permohonan Izin Kegiatan Baru',
      pesan: `"${nama_kegiatan}" oleh ${penyelenggara} memerlukan tinjauan DPM.`,
      jenis: 'izin',
      link: `/dashboard/izin/${newIzin.id}`,
      detail: {
        Kode: kode,
        'Penanggung Jawab': penanggung_jawab,
        Jadwal: `${tanggal_mulai}${newIzin.waktu_mulai ? ` ${newIzin.waktu_mulai}` : ''}`,
        Lokasi: lokasi,
        'Estimasi Peserta': newIzin.estimasi_peserta,
      },
    });

    // Kirim email konfirmasi jika ada email
    if (email_pj) {
      try {
        const { sendEmail } = await import('@/lib/mailer');
        await sendEmail({
          to: email_pj,
          subject: `[DPM ITB Riau] Tanda Terima Permohonan Izin — ${nama_kegiatan}`,
          html: `
            <h2>Permohonan Izin Kegiatan Diterima</h2>
            <p>Halo ${penanggung_jawab},</p>
            <p>Permohonan izin kegiatan <strong>"${nama_kegiatan}"</strong> telah kami terima dan sedang dalam proses tinjauan DPM ITB Riau.</p>
            <p><strong>Kode Permohonan Anda:</strong> ${kode}</p>
            <p>Kami akan segera menghubungi Anda melalui WhatsApp atau email ini.</p>
            <br/><p>Salam,<br/>DPM ITB Riau</p>
          `
        });
      } catch (e) {
        console.error('Email error (non-critical):', e);
      }
    }

    // Kirim konfirmasi WhatsApp ke Penanggung Jawab
    if (no_hp_pj) {
      try {
        const { sendWhatsApp } = await import('@/lib/whatsapp');
        await sendWhatsApp({
          to: no_hp_pj,
          message: `*DPM ITB RIAU — Tanda Terima Izin Kegiatan*\n\nHalo ${penanggung_jawab},\nPermohonan izin kegiatan *"${nama_kegiatan}"* (${penyelenggara}) telah berhasil kami terima.\n\n*Kode Tracking:* ${kode}\nStatus: Menunggu Tinjauan\n\nAnda dapat memantau status persetujuan di portal resmi DPM Connect.\n\nTerima kasih.`
        });
      } catch (e) {
        console.error('WA PJ error:', e);
      }
    }

    // Kirim notifikasi WA ke Pengurus DPM jika nomor admin dikonfigurasi
    const adminWA = process.env.ADMIN_WHATSAPP;
    if (adminWA) {
      try {
        const { sendWhatsApp } = await import('@/lib/whatsapp');
        await sendWhatsApp({
          to: adminWA,
          message: `*DPM CONNECT — Permohonan Izin Baru*\n\nTerdapat permohonan izin baru masuk:\n• *Acara:* ${nama_kegiatan}\n• *Penyelenggara:* ${penyelenggara}\n• *PJ:* ${penanggung_jawab} (${no_hp_pj})\n• *Jadwal:* ${tanggal_mulai}\n• *Lokasi:* ${lokasi}\n\nSilakan buka dashboard DPM untuk meninjau.`
        });
      } catch (e) {
        console.error('WA Admin error:', e);
      }
    }

    return NextResponse.json({ success: true, kode, id: newIzin.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating izin kegiatan:', error);
    return NextResponse.json({ error: 'Gagal mengirim permohonan' }, { status: 500 });
  }
}
