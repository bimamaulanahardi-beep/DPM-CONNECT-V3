import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createInAppNotification, ringkas, statusLabel } from '@/lib/notification';

export const dynamic = 'force-dynamic';

// GET — Ambil daftar LPJ
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const isPublicQuery = searchParams.get('public') === 'true';

    const user = session?.user as any;
    const isDpmStaff = user && ['admin', 'pimpinan', 'ketua_komisi', 'anggota'].includes(user.role);
    const isBem = user && user.role === 'bem';

    let whereClause: any = {};

    if (!session || !user || isPublicQuery) {
      whereClause = { status: 'diterbitkan' };
    } else if (isBem) {
      whereClause = {
        OR: [
          { status: 'diterbitkan' },
          { lembaga: { contains: 'BEM', mode: 'insensitive' } },
          { created_by: user.name || user.nim }
        ]
      };
    } else if (isDpmStaff) {
      // DPM Staff can view all LPJ
      whereClause = {};
    } else {
      whereClause = { status: 'diterbitkan' };
    }

    const list = await prisma.laporanLPJ.findMany({
      where: whereClause,
      include: {
        sections: {
          select: {
            id: true,
            judul: true,
            urutan: true,
          },
          orderBy: { urutan: 'asc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(list);
  } catch (error) {
    console.error('Error fetching LPJ list:', error);
    return NextResponse.json({ error: 'Gagal memuat data LPJ' }, { status: 500 });
  }
}

// POST — Buat LPJ baru (DPM & BEM)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    const allowedRoles = ['admin', 'pimpinan', 'ketua_komisi', 'anggota', 'bem'];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Hanya pengurus DPM atau BEM yang dapat membuat LPJ' }, { status: 403 });
    }

    const body = await request.json();
    const {
      judul,
      periode,
      lembaga,
      ketua,
      status = 'draft',
      ringkasan,
      sections = []
    } = body;

    if (!judul || !periode || !lembaga || !ketua) {
      return NextResponse.json({ error: 'Judul, periode, lembaga, dan nama ketua wajib diisi' }, { status: 400 });
    }

    const now = new Date().toISOString();

    const formattedSections = Array.isArray(sections) && sections.length > 0
      ? sections.map((s: any, idx: number) => ({
          judul: s.judul || `Bagian ${idx + 1}`,
          konten: s.konten || '',
          urutan: typeof s.urutan === 'number' ? s.urutan : idx + 1,
        }))
      : [
          { judul: 'I. Pendahuluan & Latar Belakang', konten: 'Penjelasan umum kepengurusan dan arah kebijakan...', urutan: 1 },
          { judul: 'II. Realisasi Program Kerja & Kinerja', konten: 'Capaian dan laporan kegiatan yang telah diselenggarakan...', urutan: 2 },
          { judul: 'III. Laporan Realisasi Anggaran Keuangan', konten: 'Rincian penggunaan dana dan saldo akhir...', urutan: 3 },
          { judul: 'IV. Evaluasi, Hambatan & Saran', konten: 'Kendala yang dihadapi serta rekomendasi kepengurusan selanjutnya...', urutan: 4 },
        ];

    const newLPJ = await prisma.laporanLPJ.create({
      data: {
        judul,
        periode,
        lembaga,
        ketua,
        status: status === 'diterbitkan' ? 'diterbitkan' : 'draft',
        ringkasan: ringkasan || '',
        created_by: user.name || user.nim || 'Pengurus Kemahasiswaan',
        created_at: now,
        updated_at: now,
        sections: {
          create: formattedSections,
        }
      },
      include: {
        sections: {
          orderBy: { urutan: 'asc' }
        }
      }
    });

    const lpjDetail = {
      Lembaga: lembaga,
      Periode: periode,
      Ketua: ketua,
      Status: statusLabel(newLPJ.status),
      'Dibuat oleh': newLPJ.created_by,
      Ringkasan: ringkas(ringkasan, 400),
    };

    if (newLPJ.status === 'diterbitkan') {
      await createInAppNotification({
        judul: 'LPJ Baru Diterbitkan',
        pesan: `${lembaga} telah mempublikasikan LPJ periode ${periode}: "${judul}".`,
        jenis: 'lpj',
        link: `/lpj/${newLPJ.id}`,
        detail: lpjDetail,
      });
    } else {
      await createInAppNotification({
        judul: 'Draft LPJ Baru Dibuat',
        pesan: `Draft LPJ "${judul}" (${lembaga}, periode ${periode}) telah dibuat.`,
        jenis: 'lpj',
        link: `/dashboard/lpj/${newLPJ.id}`,
        detail: lpjDetail,
      });
    }

    return NextResponse.json(newLPJ);
  } catch (error) {
    console.error('Error creating LPJ:', error);
    return NextResponse.json({ error: 'Gagal membuat dokumen LPJ' }, { status: 500 });
  }
}
