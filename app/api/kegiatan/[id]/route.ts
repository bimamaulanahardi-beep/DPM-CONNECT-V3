import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createInAppNotification, ringkas, statusLabel } from '@/lib/notification';

export const dynamic = 'force-dynamic';

interface Params {
  params: {
    id: string;
  };
}

// GET — Detail satu kegiatan DPM
export async function GET(_: Request, { params }: Params) {
  try {
    const item = await prisma.kegiatanDPM.findUnique({
      where: { id: params.id },
    });
    if (!item) {
      return NextResponse.json({ error: 'Kegiatan tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error: any) {
    console.error('Error fetching kegiatan detail:', error);
    return NextResponse.json({ error: 'Gagal memuat detail kegiatan' }, { status: 500 });
  }
}

// PUT — Perbarui data atau status kegiatan DPM
export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user as any;
    if (user.role === 'mahasiswa') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();

    const existing = await prisma.kegiatanDPM.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Kegiatan tidak ditemukan' }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (body.nama !== undefined) dataToUpdate.nama = body.nama.trim();
    if (body.kategori !== undefined) dataToUpdate.kategori = body.kategori;
    if (body.deskripsi !== undefined) dataToUpdate.deskripsi = body.deskripsi?.trim() || null;
    if (body.tanggal !== undefined) dataToUpdate.tanggal = body.tanggal;
    if (body.waktu_mulai !== undefined) dataToUpdate.waktu_mulai = body.waktu_mulai;
    if (body.waktu_selesai !== undefined) dataToUpdate.waktu_selesai = body.waktu_selesai || null;
    if (body.lokasi !== undefined) dataToUpdate.lokasi = body.lokasi.trim();
    if (body.penanggung_jawab !== undefined) dataToUpdate.penanggung_jawab = body.penanggung_jawab?.trim() || null;
    if (body.status !== undefined) dataToUpdate.status = body.status;

    const updated = await prisma.kegiatanDPM.update({
      where: { id },
      data: dataToUpdate,
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        user: user.name || 'Pengurus DPM',
        aksi: 'Memperbarui Kegiatan DPM',
        modul: 'Kegiatan DPM',
        detail: `Memperbarui kegiatan: "${updated.nama}" (Status: ${updated.status})`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    // Notifikasi Otomatis ke Grup WA
    const statusBerubah = body.status !== undefined && existing.status !== updated.status;
    const jadwalBerubah =
      existing.tanggal !== updated.tanggal ||
      existing.waktu_mulai !== updated.waktu_mulai ||
      existing.lokasi !== updated.lokasi;

    const kegiatanDetail = {
      'Nama Kegiatan': updated.nama,
      Jadwal: `${updated.tanggal} pukul ${updated.waktu_mulai}${updated.waktu_selesai ? ` - ${updated.waktu_selesai}` : ' WIB'}`,
      Lokasi: updated.lokasi,
      'Penanggung Jawab': updated.penanggung_jawab,
      Status: statusLabel(updated.status),
      'Diperbarui oleh': user.name || 'Pengurus DPM',
    };

    if (statusBerubah && updated.status === 'berlangsung') {
      await createInAppNotification({
        judul: 'Kegiatan DPM Sedang Berlangsung',
        pesan: `Kegiatan resmi "${updated.nama}" saat ini sedang berlangsung di ${updated.lokasi}.`,
        jenis: 'kegiatan',
        link: `/dashboard/kalender`,
        detail: kegiatanDetail,
      });
    } else if (statusBerubah && updated.status === 'selesai') {
      await createInAppNotification({
        judul: 'Kegiatan DPM Selesai',
        pesan: `Kegiatan "${updated.nama}" telah selesai dilaksanakan.`,
        jenis: 'kegiatan',
        link: `/dashboard/kalender`,
        detail: kegiatanDetail,
      });
    } else if (statusBerubah && /batal|tunda/i.test(updated.status)) {
      await createInAppNotification({
        judul: /batal/i.test(updated.status) ? 'Kegiatan DPM Dibatalkan' : 'Kegiatan DPM Ditunda',
        pesan: `Kegiatan "${updated.nama}" ${/batal/i.test(updated.status) ? 'DIBATALKAN' : 'DITUNDA'}.`,
        jenis: 'kegiatan',
        link: `/dashboard/kalender`,
        detail: kegiatanDetail,
      });
    } else if (jadwalBerubah) {
      await createInAppNotification({
        judul: 'Jadwal Kegiatan DPM Diubah',
        pesan: `Terdapat perubahan jadwal/lokasi untuk kegiatan "${updated.nama}". Mohon perhatikan jadwal terbaru.`,
        jenis: 'kegiatan',
        link: `/dashboard/kalender`,
        detail: {
          'Jadwal Lama': `${existing.tanggal} pukul ${existing.waktu_mulai} — ${existing.lokasi}`,
          ...kegiatanDetail,
        },
      });
    } else if (statusBerubah) {
      await createInAppNotification({
        judul: 'Status Kegiatan DPM Diperbarui',
        pesan: `Status kegiatan "${updated.nama}" berubah dari ${statusLabel(existing.status)} menjadi ${statusLabel(updated.status)}.`,
        jenis: 'kegiatan',
        link: `/dashboard/kalender`,
        detail: kegiatanDetail,
      });
    } else {
      await createInAppNotification({
        judul: 'Data Kegiatan DPM Diperbarui',
        pesan: `Informasi kegiatan "${updated.nama}" telah diperbarui.`,
        jenis: 'kegiatan',
        link: `/dashboard/kalender`,
        detail: kegiatanDetail,
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating kegiatan DPM:', error);
    return NextResponse.json({ error: 'Gagal memperbarui kegiatan DPM' }, { status: 500 });
  }
}

// DELETE — Hapus kegiatan DPM
export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user as any;
    if (user.role !== 'admin' && user.role !== 'pimpinan') {
      return NextResponse.json({ error: 'Hanya Admin atau Pimpinan yang dapat menghapus kegiatan' }, { status: 403 });
    }

    const { id } = params;
    const existing = await prisma.kegiatanDPM.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Kegiatan tidak ditemukan' }, { status: 404 });
    }

    await prisma.kegiatanDPM.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        user: user.name || 'Admin',
        aksi: 'Menghapus Kegiatan DPM',
        modul: 'Kegiatan DPM',
        detail: `Menghapus kegiatan: "${existing.nama}" (ID: ${id})`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    await createInAppNotification({
      judul: 'Kegiatan DPM Dihapus',
      pesan: `Kegiatan "${existing.nama}" (${existing.tanggal} pukul ${existing.waktu_mulai}) telah dihapus oleh ${user.name || 'Admin'}.`,
      jenis: 'kegiatan',
      detail: {
        'Nama Kegiatan': existing.nama,
        Lokasi: existing.lokasi,
        'Status Terakhir': statusLabel(existing.status),
      },
    });

    return NextResponse.json({ success: true, message: 'Kegiatan berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting kegiatan DPM:', error);
    return NextResponse.json({ error: 'Gagal menghapus kegiatan DPM' }, { status: 500 });
  }
}
