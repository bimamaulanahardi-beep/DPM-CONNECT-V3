import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface Params {
  params: {
    id: string;
  };
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const body = await request.json();
    const { candidate_id, voter_nama, voter_nim, voter_prodi } = body; 

    if (!candidate_id || !voter_nama || !voter_nim || !voter_prodi) {
      return NextResponse.json({ error: 'Data tidak lengkap (Butuh Kandidat, Nama, NIM, Prodi)' }, { status: 400 });
    }

    // 1. Check if event is active
    const event = await prisma.pemiraEvent.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json({ error: 'Pemira event not found' }, { status: 404 });
    }
    if (event.status !== 'aktif') {
      return NextResponse.json({ error: 'Pemilihan belum dibuka atau sudah ditutup' }, { status: 400 });
    }

    // 2. Check if user already voted in this Pemira event (By NIM)
    const existingVote = await prisma.pemiraVoteRecord.findUnique({
      where: {
        pemira_id_user_nim: {
          pemira_id: id,
          user_nim: voter_nim,
        }
      }
    });

    if (existingVote) {
      return NextResponse.json({ error: 'NIM ini sudah digunakan untuk mencoblos pada Pemilu Raya ini.' }, { status: 403 });
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
          user_nim: voter_nim,
          voter_nama: voter_nama,
          voter_prodi: voter_prodi,
          tanggal: new Date().toISOString(),
        }
      })
    ]);

    return NextResponse.json({ message: 'Vote berhasil', candidate: updatedCandidate });
  } catch (error: any) {
    console.error('Error casting public Pemira vote:', error);
    return NextResponse.json({ error: 'Failed to cast vote' }, { status: 500 });
  }
}
