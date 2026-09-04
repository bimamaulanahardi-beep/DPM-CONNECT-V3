import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createInAppNotification } from '@/lib/notification';

export const dynamic = 'force-dynamic';

// GET — Ambil daftar referendum
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const isPublicQuery = searchParams.get('public') === 'true';

    const user = session?.user as any;
    const isDpmStaff = user && ['admin', 'pimpinan', 'ketua_komisi', 'anggota'].includes(user.role);

    // Jika publik atau bukan staf DPM, hanya tampilkan yang aktif atau selesai
    const whereClause = (!isDpmStaff || isPublicQuery)
      ? { status: { in: ['aktif', 'selesai'] } }
      : {};

    const referendums = await prisma.referendum.findMany({
      where: whereClause,
      include: {
        votes: {
          select: {
            pilihan: true,
            user_nim: true,
            tanggal: true,
          }
        }
      },
      orderBy: { created_at: 'desc' },
    });

    // Format data & hitung perolehan suara per opsi
    const formatted = referendums.map((ref) => {
      let parsedOpsi: string[] = [];
      try {
        parsedOpsi = JSON.parse(ref.opsi);
      } catch (e) {
        parsedOpsi = ['Setuju', 'Tidak Setuju'];
      }

      // Hitung perolehan suara
      const voteCounts: Record<string, number> = {};
      parsedOpsi.forEach(opt => { voteCounts[opt] = 0; });

      ref.votes.forEach((v) => {
        if (voteCounts[v.pilihan] !== undefined) {
          voteCounts[v.pilihan]++;
        } else {
          voteCounts[v.pilihan] = 1;
        }
      });

      // Cek apakah user saat ini sudah pernah vote
      const userVote = user?.nim ? ref.votes.find(v => v.user_nim === user.nim) : null;

      return {
        id: ref.id,
        judul: ref.judul,
        deskripsi: ref.deskripsi,
        pertanyaan: ref.pertanyaan,
        opsi: parsedOpsi,
        status: ref.status,
        tanggal_mulai: ref.tanggal_mulai,
        tanggal_selesai: ref.tanggal_selesai,
        total_pemilih: ref.votes.length,
        is_publik: ref.is_publik,
        created_by: ref.created_by,
        created_at: ref.created_at,
        voteCounts,
        hasVoted: !!userVote,
        myVote: userVote ? userVote.pilihan : null,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching referendum list:', error);
    return NextResponse.json({ error: 'Gagal memuat data referendum' }, { status: 500 });
  }
}

// POST — Buat referendum baru (khusus DPM: admin, pimpinan, ketua_komisi, anggota)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (!['admin', 'pimpinan', 'ketua_komisi', 'anggota'].includes(user.role)) {
      return NextResponse.json({ error: 'Hanya anggota/pimpinan DPM yang dapat membuat referendum' }, { status: 403 });
    }

    const body = await request.json();
    const {
      judul,
      deskripsi,
      pertanyaan,
      opsi, // array of strings, contoh: ["Setuju", "Tidak Setuju", "Abstain"]
      status = 'aktif', // 'draft' | 'aktif'
      tanggal_mulai,
      tanggal_selesai,
      is_publik = true,
    } = body;

    if (!judul || !pertanyaan || !tanggal_mulai || !tanggal_selesai) {
      return NextResponse.json({ error: 'Judul, pertanyaan, dan tanggal pelaksanaan wajib diisi' }, { status: 400 });
    }

    const validOpsi = Array.isArray(opsi) && opsi.length >= 2 ? opsi : ['Setuju', 'Tidak Setuju', 'Abstain'];
    const now = new Date().toISOString();

    const referendum = await prisma.referendum.create({
      data: {
        judul,
        deskripsi: deskripsi || '',
        pertanyaan,
        opsi: JSON.stringify(validOpsi),
        status: status === 'draft' ? 'draft' : 'aktif',
        tanggal_mulai,
        tanggal_selesai,
        total_pemilih: 0,
        is_publik: is_publik !== false,
        created_by: user.name || user.nim || 'DPM ITB Riau',
        created_at: now,
      },
    });

    if (referendum.status === 'aktif') {
      await createInAppNotification({
        judul: '🗳️ Referendum Baru Dibuka',
        pesan: `Referendum: "${judul}" telah dibuka untuk seluruh mahasiswa ITB Riau.`,
        jenis: 'voting',
        link: `/referendum`,
      });
    }

    return NextResponse.json(referendum);
  } catch (error) {
    console.error('Error creating referendum:', error);
    return NextResponse.json({ error: 'Gagal membuat referendum' }, { status: 500 });
  }
}
