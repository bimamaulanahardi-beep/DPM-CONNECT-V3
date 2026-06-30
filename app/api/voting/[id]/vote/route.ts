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
    if (user.role === 'mahasiswa') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { pilihan } = body; // 'setuju', 'tidak_setuju', or 'abstain'

    if (!pilihan || !['setuju', 'tidak_setuju', 'abstain'].includes(pilihan)) {
      return NextResponse.json({ error: 'Invalid vote option' }, { status: 400 });
    }

    // TODO: Issue #4 - Prevent duplicate votes.
    // Currently, there is no VoteRecord model in Prisma schema to track if a user has already voted.
    // To fully implement duplicate vote prevention, a VoteRecord model needs to be added to the schema.
    // For now, we only validate that the session user exists (done above).


    const existing = await prisma.voting.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Voting session not found' }, { status: 404 });
    }

    if (existing.status !== 'aktif') {
      return NextResponse.json({ error: 'Voting session is not active' }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (pilihan === 'setuju') {
      dataToUpdate.hasil_setuju = { increment: 1 };
    } else if (pilihan === 'tidak_setuju') {
      dataToUpdate.hasil_tidak_setuju = { increment: 1 };
    } else if (pilihan === 'abstain') {
      dataToUpdate.hasil_abstain = { increment: 1 };
    }
    dataToUpdate.hasil_total = { increment: 1 };

    const updated = await prisma.voting.update({
      where: { id },
      data: dataToUpdate,
    });

    // Record to AuditLog
    await prisma.auditLog.create({
      data: {
        user: session.user?.name || 'Anggota DPM',
        aksi: 'Menyalurkan hak suara',
        modul: 'Voting',
        detail: `Memilih "${pilihan}" pada voting: "${updated.judul}" (ID: ${id})`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    const formattedVoting = {
      id: updated.id,
      judul: updated.judul,
      deskripsi: updated.deskripsi,
      status: updated.status,
      sidang_id: updated.sidang_id || undefined,
      tanggal_mulai: updated.tanggal_mulai || undefined,
      tanggal_selesai: updated.tanggal_selesai || undefined,
      quorum_required: updated.quorum_required,
      total_pemilih: updated.total_pemilih,
      jenis: updated.jenis as 'binary' | 'multipilih',
      opsi_multipilih: updated.opsi_multipilih ? JSON.parse(updated.opsi_multipilih) : undefined,
      hasil: {
        setuju: updated.hasil_setuju,
        tidak_setuju: updated.hasil_tidak_setuju,
        abstain: updated.hasil_abstain,
        total: updated.hasil_total,
      },
      created_by: updated.created_by,
    };

    return NextResponse.json(formattedVoting);
  } catch (error: any) {
    console.error('Error casting vote:', error);
    return NextResponse.json({ error: 'Failed to cast vote' }, { status: 500 });
  }
}
