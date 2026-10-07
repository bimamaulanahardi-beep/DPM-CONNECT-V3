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

export async function GET(request: Request, { params }: Params) {
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
    const item = await prisma.voting.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: 'Voting session not found' }, { status: 404 });
    }

    // Periksa apakah user yang sedang login sudah pernah mem-vote
    const existingVote = await prisma.voteRecord.findUnique({
      where: {
        voting_id_user_nim: {
          voting_id: id,
          user_nim: user.nim,
        }
      }
    });

    const formattedVoting = {
      id: item.id,
      judul: item.judul,
      deskripsi: item.deskripsi,
      status: item.status,
      sidang_id: item.sidang_id || undefined,
      tanggal_mulai: item.tanggal_mulai || undefined,
      tanggal_selesai: item.tanggal_selesai || undefined,
      quorum_required: item.quorum_required,
      total_pemilih: item.total_pemilih,
      jenis: item.jenis as 'binary' | 'multipilih',
      opsi_multipilih: item.opsi_multipilih ? JSON.parse(item.opsi_multipilih) : undefined,
      hasil: {
        setuju: item.hasil_setuju,
        tidak_setuju: item.hasil_tidak_setuju,
        abstain: item.hasil_abstain,
        total: item.hasil_total,
      },
      created_by: item.created_by,
      has_voted: !!existingVote,
    };

    return NextResponse.json(formattedVoting);
  } catch (error: any) {
    console.error('Error fetching voting detail:', error);
    return NextResponse.json({ error: 'Failed to fetch voting detail' }, { status: 500 });
  }
}

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

    const existing = await prisma.voting.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Voting session not found' }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (body.judul !== undefined) dataToUpdate.judul = body.judul;
    if (body.deskripsi !== undefined) dataToUpdate.deskripsi = body.deskripsi;
    if (body.status !== undefined) dataToUpdate.status = body.status;
    if (body.sidang_id !== undefined) dataToUpdate.sidang_id = body.sidang_id;
    if (body.tanggal_mulai !== undefined) dataToUpdate.tanggal_mulai = body.tanggal_mulai;
    if (body.tanggal_selesai !== undefined) dataToUpdate.tanggal_selesai = body.tanggal_selesai;
    if (body.quorum_required !== undefined) dataToUpdate.quorum_required = Number(body.quorum_required);
    if (body.total_pemilih !== undefined) dataToUpdate.total_pemilih = Number(body.total_pemilih);
    if (body.jenis !== undefined) dataToUpdate.jenis = body.jenis;
    if (body.opsi_multipilih !== undefined) dataToUpdate.opsi_multipilih = JSON.stringify(body.opsi_multipilih);

    const updated = await prisma.voting.update({
      where: { id },
      data: dataToUpdate,
    });

    // Notifikasi grup WA
    if (existing.status !== 'aktif' && updated.status === 'aktif') {
      await createInAppNotification({
        judul: 'Pemungutan Suara Dibuka',
        pesan: `Sesi voting "${updated.judul}" telah dibuka. Silakan berikan suara Anda.`,
        jenis: 'voting',
        link: `/dashboard/voting/${id}`,
        detail: { Deskripsi: ringkas(updated.deskripsi, 400), Selesai: updated.tanggal_selesai },
      });
    } else if (existing.status !== 'selesai' && updated.status === 'selesai') {
      let hasil: string;
      if (updated.jenis === 'multipilih') {
        const grouped = await prisma.voteRecord.groupBy({
          by: ['pilihan'],
          where: { voting_id: id },
          _count: { _all: true },
        });
        hasil = grouped.length
          ? '\n' + grouped
              .sort((a, b) => b._count._all - a._count._all)
              .map((g) => `   - ${g.pilihan || 'Abstain'}: ${g._count._all} suara`)
              .join('\n')
          : 'Belum ada suara';
      } else {
        hasil = `\n   - Setuju: ${updated.hasil_setuju}\n   - Tidak Setuju: ${updated.hasil_tidak_setuju}\n   - Abstain: ${updated.hasil_abstain}`;
      }
      await createInAppNotification({
        judul: 'Pemungutan Suara Ditutup',
        pesan: `Sesi voting "${updated.judul}" telah ditutup.`,
        jenis: 'voting',
        link: `/dashboard/voting/${id}`,
        detail: {
          'Total Suara': `${updated.hasil_total} dari ${updated.total_pemilih} pemilih`,
          Hasil: hasil,
        },
      });
    } else if (existing.status !== updated.status) {
      await createInAppNotification({
        judul: 'Status Voting Diperbarui',
        pesan: `Status voting "${updated.judul}" berubah dari ${statusLabel(existing.status)} menjadi ${statusLabel(updated.status)}.`,
        jenis: 'voting',
        link: `/dashboard/voting/${id}`,
      });
    } else {
      await createInAppNotification({
        judul: 'Sesi Voting Diperbarui',
        pesan: `Data sesi voting "${updated.judul}" telah diperbarui oleh ${session.user?.name || 'Anggota DPM'}.`,
        jenis: 'voting',
        link: `/dashboard/voting/${id}`,
        detail: { Status: statusLabel(updated.status), Mulai: updated.tanggal_mulai, Selesai: updated.tanggal_selesai },
      });
    }

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
    console.error('Error updating voting session:', error);
    return NextResponse.json({ error: 'Failed to update voting session' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
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
    const existing = await prisma.voting.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Voting session not found' }, { status: 404 });
    }

    await prisma.voting.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        user: session.user?.name || 'Anggota DPM',
        aksi: 'Menghapus sesi voting',
        modul: 'Voting',
        detail: `Menghapus sesi voting: "${existing.judul}" (ID: ${id})`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    await createInAppNotification({
      judul: 'Sesi Voting Dihapus',
      pesan: `Sesi voting "${existing.judul}" telah dihapus oleh ${session.user?.name || 'Anggota DPM'}.`,
      jenis: 'voting',
      detail: { 'Status Terakhir': statusLabel(existing.status), 'Total Suara': existing.hasil_total },
    });

    return NextResponse.json({ message: 'Voting berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting voting session:', error);
    return NextResponse.json({ error: 'Failed to delete voting session' }, { status: 500 });
  }
}
