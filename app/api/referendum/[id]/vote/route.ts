import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Silakan login terlebih dahulu untuk memberikan suara.' }, { status: 401 });
    }

    const user = session.user as any;
    const userNim = user.nim;

    if (!userNim) {
      return NextResponse.json({ error: 'Akun Anda tidak memiliki NIM yang valid untuk berpartisipasi.' }, { status: 400 });
    }

    const body = await request.json();
    const { pilihan } = body;

    if (!pilihan) {
      return NextResponse.json({ error: 'Pilihan suara wajib ditentukan.' }, { status: 400 });
    }

    // Ambil data referendum
    const ref = await prisma.referendum.findUnique({
      where: { id: params.id },
    });

    if (!ref) {
      return NextResponse.json({ error: 'Referendum tidak ditemukan.' }, { status: 404 });
    }

    if (ref.status !== 'aktif') {
      return NextResponse.json({ error: 'Referendum ini sedang tidak aktif atau telah ditutup.' }, { status: 400 });
    }

    // Verifikasi pilihan ada dalam opsi yang disediakan
    let validOptions: string[] = [];
    try {
      validOptions = JSON.parse(ref.opsi);
    } catch (e) {
      validOptions = ['Setuju', 'Tidak Setuju'];
    }

    if (!validOptions.includes(pilihan)) {
      return NextResponse.json({ error: 'Pilihan opsi tidak valid untuk referendum ini.' }, { status: 400 });
    }

    // Cek apakah user sudah pernah vote di referendum ini
    const existingVote = await prisma.referendumVote.findUnique({
      where: {
        referendum_id_user_nim: {
          referendum_id: ref.id,
          user_nim: userNim,
        }
      }
    });

    if (existingVote) {
      return NextResponse.json({ error: 'Anda sudah pernah memberikan suara pada referendum ini.' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Catat vote dan perbarui total pemilih secara atomic transaction
    await prisma.$transaction([
      prisma.referendumVote.create({
        data: {
          referendum_id: ref.id,
          user_nim: userNim,
          pilihan,
          tanggal: now,
        }
      }),
      prisma.referendum.update({
        where: { id: ref.id },
        data: {
          total_pemilih: {
            increment: 1,
          }
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: 'Suara Anda berhasil dicatat!',
      pilihan,
    });
  } catch (error: any) {
    console.error('Error submitting vote:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Anda sudah memberikan suara pada referendum ini sebelumnya.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Gagal mencatat suara Anda. Silakan coba lagi.' }, { status: 500 });
  }
}
