import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface Params {
  params: {
    id: string;
  };
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user as any;

    const { id } = params;
    const body = await request.json();
    const { candidate_id } = body; 

    if (!candidate_id) {
      return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
    }

    // 1. Check if user already voted in this Pemira event
    const existingVote = await prisma.pemiraVoteRecord.findUnique({
      where: {
        pemira_id_user_nim: {
          pemira_id: id,
          user_nim: user.nim,
        }
      }
    });

    if (existingVote) {
      return NextResponse.json({ error: 'Anda sudah mencoblos pada Pemilu Raya ini.' }, { status: 403 });
    }

    // 2. Check if event is active
    const event = await prisma.pemiraEvent.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json({ error: 'Pemira event not found' }, { status: 404 });
    }
    if (event.status !== 'aktif') {
      return NextResponse.json({ error: 'Pemilihan belum dibuka atau sudah ditutup' }, { status: 400 });
    }

    // 3. Execute Vote using Transaction
    const [updatedCandidate, newRecord] = await prisma.$transaction([
      prisma.pemiraCandidate.update({
        where: { id: candidate_id },
        data: { total_suara: { increment: 1 } },
      }),
      prisma.pemiraVoteRecord.create({
        data: {
          pemira_id: id,
          user_nim: user.nim,
          tanggal: new Date().toISOString(),
        }
      }),
      prisma.auditLog.create({
        data: {
          user: session.user?.name || 'Mahasiswa',
          aksi: 'Mencoblos Pemilu Raya',
          modul: 'Pemira',
          detail: `Berpartisipasi pada Pemira: "${event.judul}"`,
          ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
          tanggal: new Date().toISOString(),
        },
      })
    ]);

    return NextResponse.json({ message: 'Vote berhasil', candidate: updatedCandidate });
  } catch (error: any) {
    console.error('Error casting Pemira vote:', error);
    return NextResponse.json({ error: 'Failed to cast vote' }, { status: 500 });
  }
}
