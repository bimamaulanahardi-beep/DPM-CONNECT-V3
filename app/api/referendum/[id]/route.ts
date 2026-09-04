import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET — Ambil detail satu referendum
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    const ref = await prisma.referendum.findUnique({
      where: { id: params.id },
      include: {
        votes: {
          select: {
            id: true,
            pilihan: true,
            user_nim: true,
            tanggal: true,
          }
        }
      }
    });

    if (!ref) {
      return NextResponse.json({ error: 'Referendum tidak ditemukan' }, { status: 404 });
    }

    let parsedOpsi: string[] = [];
    try {
      parsedOpsi = JSON.parse(ref.opsi);
    } catch (e) {
      parsedOpsi = ['Setuju', 'Tidak Setuju'];
    }

    const voteCounts: Record<string, number> = {};
    parsedOpsi.forEach(opt => { voteCounts[opt] = 0; });

    ref.votes.forEach((v) => {
      if (voteCounts[v.pilihan] !== undefined) {
        voteCounts[v.pilihan]++;
      } else {
        voteCounts[v.pilihan] = 1;
      }
    });

    const userVote = user?.nim ? ref.votes.find(v => v.user_nim === user.nim) : null;

    return NextResponse.json({
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
      // Jika DPM, sertakan daftar record voter untuk audit
      voters: (user && ['admin', 'pimpinan', 'ketua_komisi', 'anggota'].includes(user.role))
        ? ref.votes.map(v => ({ nim: v.user_nim, tanggal: v.tanggal, pilihan: v.pilihan }))
        : undefined,
    });
  } catch (error) {
    console.error('Error fetching referendum detail:', error);
    return NextResponse.json({ error: 'Gagal memuat detail referendum' }, { status: 500 });
  }
}

// PATCH — Perbarui status atau info referendum (DPM)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (!['admin', 'pimpinan', 'ketua_komisi', 'anggota'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { status, judul, deskripsi, pertanyaan, tanggal_mulai, tanggal_selesai, is_publik } = body;

    const dataToUpdate: any = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (judul !== undefined) dataToUpdate.judul = judul;
    if (deskripsi !== undefined) dataToUpdate.deskripsi = deskripsi;
    if (pertanyaan !== undefined) dataToUpdate.pertanyaan = pertanyaan;
    if (tanggal_mulai !== undefined) dataToUpdate.tanggal_mulai = tanggal_mulai;
    if (tanggal_selesai !== undefined) dataToUpdate.tanggal_selesai = tanggal_selesai;
    if (is_publik !== undefined) dataToUpdate.is_publik = is_publik;

    const updated = await prisma.referendum.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating referendum:', error);
    return NextResponse.json({ error: 'Gagal memperbarui data referendum' }, { status: 500 });
  }
}

// DELETE — Hapus referendum (Admin / Pimpinan)
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== 'admin' && user.role !== 'pimpinan') {
      return NextResponse.json({ error: 'Hanya Admin atau Pimpinan yang dapat menghapus referendum' }, { status: 403 });
    }

    await prisma.referendum.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting referendum:', error);
    return NextResponse.json({ error: 'Gagal menghapus referendum' }, { status: 500 });
  }
}
