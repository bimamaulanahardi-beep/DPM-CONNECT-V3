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

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = params;
    const sidang = await prisma.sidang.findUnique({
      where: { id },
    });

    if (!sidang) {
      return NextResponse.json({ error: 'Sidang not found' }, { status: 404 });
    }

    const formattedSidang = {
      ...sidang,
      agenda: JSON.parse(sidang.agenda || '[]'),
      peserta: JSON.parse(sidang.peserta || '[]'),
    };

    return NextResponse.json(formattedSidang);
  } catch (error: any) {
    console.error('Error fetching sidang detail:', error);
    return NextResponse.json({ error: 'Failed to fetch sidang detail' }, { status: 500 });
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

    // Check if exists
    const existing = await prisma.sidang.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Sidang not found' }, { status: 404 });
    }

    const dataToUpdate: any = {};

    if (body.judul !== undefined) dataToUpdate.judul = body.judul;
    if (body.jenis !== undefined) dataToUpdate.jenis = body.jenis;
    if (body.status !== undefined) dataToUpdate.status = body.status;
    if (body.tanggal !== undefined) dataToUpdate.tanggal = body.tanggal;
    if (body.waktu_mulai !== undefined) dataToUpdate.waktu_mulai = body.waktu_mulai;
    if (body.waktu_selesai !== undefined) dataToUpdate.waktu_selesai = body.waktu_selesai;
    if (body.lokasi !== undefined) dataToUpdate.lokasi = body.lokasi;
    if (body.link_daring !== undefined) dataToUpdate.link_daring = body.link_daring;
    if (body.komisi !== undefined) dataToUpdate.komisi = body.komisi;
    if (body.agenda !== undefined) dataToUpdate.agenda = JSON.stringify(body.agenda);
    if (body.peserta !== undefined) dataToUpdate.peserta = JSON.stringify(body.peserta);
    if (body.notulensi !== undefined) dataToUpdate.notulensi = body.notulensi;
    if (body.quorum_required !== undefined) dataToUpdate.quorum_required = Number(body.quorum_required);
    if (body.quorum_achieved !== undefined) dataToUpdate.quorum_achieved = Number(body.quorum_achieved);

    const updated = await prisma.sidang.update({
      where: { id },
      data: dataToUpdate,
    });

    // Record to AuditLog
    await prisma.auditLog.create({
      data: {
        user: session.user?.name || 'Anggota DPM',
        aksi: 'Memperbarui data sidang',
        modul: 'Sidang DPM',
        detail: `Memperbarui data/status sidang: "${updated.judul}" (ID: ${id})`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    const formattedSidang = {
      ...updated,
      agenda: JSON.parse(updated.agenda || '[]'),
      peserta: JSON.parse(updated.peserta || '[]'),
    };

    return NextResponse.json(formattedSidang);
  } catch (error: any) {
    console.error('Error updating sidang:', error);
    return NextResponse.json({ error: 'Failed to update sidang' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user as any;
    if (user.role !== 'admin' && user.role !== 'pimpinan') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;

    const existing = await prisma.sidang.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Sidang not found' }, { status: 404 });
    }

    await prisma.sidang.delete({
      where: { id },
    });

    // Record to AuditLog
    await prisma.auditLog.create({
      data: {
        user: session.user?.name || 'Anggota DPM',
        aksi: 'Menghapus data sidang',
        modul: 'Sidang DPM',
        detail: `Menghapus sidang: "${existing.judul}" (ID: ${id})`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true, message: 'Sidang berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting sidang:', error);
    return NextResponse.json({ error: 'Failed to delete sidang' }, { status: 500 });
  }
}
