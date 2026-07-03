import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createInAppNotification } from '@/lib/notification';

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

    // Create Notification if status changed
    if (existing.status !== 'aktif' && updated.status === 'aktif') {
      await createInAppNotification({
        judul: 'Pemungutan Suara Dibuka',
        pesan: `Sesi voting "${updated.judul}" telah dibuka. Silakan berikan suara Anda.`,
        jenis: 'voting',
        link: `/dashboard/voting/${id}`,
      });
    } else if (existing.status !== 'selesai' && updated.status === 'selesai') {
      await createInAppNotification({
        judul: 'Pemungutan Suara Ditutup',
        pesan: `Sesi voting "${updated.judul}" telah ditutup.`,
        jenis: 'voting',
        link: `/dashboard/voting/${id}`,
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

    return NextResponse.json({ message: 'Voting berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting voting session:', error);
    return NextResponse.json({ error: 'Failed to delete voting session' }, { status: 500 });
  }
}
