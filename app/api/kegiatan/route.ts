import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createInAppNotification, ringkas, statusLabel } from '@/lib/notification';

export const dynamic = 'force-dynamic';

const KATEGORI_LABEL: Record<string, string> = {
  rapat_internal: 'Rapat Internal DPM',
  kunjungan_kerja: 'Kunjungan Kerja',
  sosialisasi: 'Sosialisasi & Edukasi',
  workshop: 'Workshop / Pelatihan',
  pelantikan: 'Pelantikan & Sumpah Jabatan',
  upgrading: 'Upgrading & Raker',
  pengawasan_lapangan: 'Pengawasan Lapangan',
  acara: 'Acara / Kegiatan Khusus',
  lainnya: 'Kegiatan Lainnya',
};

// GET — Ambil daftar kegiatan DPM
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bulan = searchParams.get('bulan'); // misal "2026-10"

    const where: any = {};
    if (bulan) {
      where.tanggal = { startsWith: bulan };
    }

    const list = await prisma.kegiatanDPM.findMany({
      where,
      orderBy: [{ tanggal: 'asc' }, { waktu_mulai: 'asc' }],
    });

    return NextResponse.json(list);
  } catch (error: any) {
    console.error('Error fetching kegiatan DPM:', error);
    return NextResponse.json({ error: 'Gagal memuat kegiatan DPM' }, { status: 500 });
  }
}

// POST — Buat kegiatan DPM baru & kirim notifikasi ke grup WA
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role === 'mahasiswa') {
      return NextResponse.json({ error: 'Akses Ditolak: Hanya pengurus DPM yang dapat membuat kegiatan.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      nama,
      kategori = 'rapat_internal',
      deskripsi,
      tanggal,
      waktu_mulai,
      waktu_selesai,
      lokasi,
      penanggung_jawab,
    } = body;

    if (!nama || !tanggal || !waktu_mulai || !lokasi) {
      return NextResponse.json(
        { error: 'Nama kegiatan, tanggal, waktu mulai, dan lokasi wajib diisi.' },
        { status: 400 }
      );
    }

    const newKegiatan = await prisma.kegiatanDPM.create({
      data: {
        nama: nama.trim(),
        kategori: kategori || 'lainnya',
        deskripsi: deskripsi?.trim() || null,
        tanggal,
        waktu_mulai,
        waktu_selesai: waktu_selesai || null,
        lokasi: lokasi.trim(),
        penanggung_jawab: penanggung_jawab?.trim() || user.name || null,
        status: 'dijadwalkan',
        created_by: user.name || user.nim || 'Pengurus DPM',
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        user: user.name || 'Pengurus DPM',
        aksi: 'Membuat Kegiatan DPM Baru',
        modul: 'Kegiatan DPM',
        detail: `Membuat kegiatan: "${newKegiatan.nama}" pada ${tanggal} pukul ${waktu_mulai} (${lokasi})`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    // Notifikasi Otomatis ke Grup WhatsApp
    const kategoriTeks = KATEGORI_LABEL[kategori] || statusLabel(kategori);
    const jadwalTeks = `${tanggal} pukul ${waktu_mulai}${waktu_selesai ? ` - ${waktu_selesai}` : ' WIB'}`;

    await createInAppNotification({
      judul: 'Agenda Kegiatan DPM Baru Dijadwalkan',
      pesan: `Kegiatan resmi DPM "${newKegiatan.nama}" telah dijadwalkan pada ${jadwalTeks} bertempat di ${lokasi}.`,
      jenis: 'kegiatan',
      link: `/dashboard/kalender`,
      detail: {
        'Nama Kegiatan': newKegiatan.nama,
        Kategori: kategoriTeks,
        Jadwal: jadwalTeks,
        Lokasi: lokasi,
        'Penanggung Jawab': newKegiatan.penanggung_jawab,
        Keterangan: deskripsi ? ringkas(deskripsi, 400) : undefined,
      },
    });

    return NextResponse.json(newKegiatan, { status: 201 });
  } catch (error: any) {
    console.error('Error creating kegiatan DPM:', error);
    return NextResponse.json({ error: error.message || 'Gagal membuat kegiatan' }, { status: 500 });
  }
}
