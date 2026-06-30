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
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user as any;
    if (user.role === 'mahasiswa') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;
    const item = await prisma.surat.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: 'Surat not found' }, { status: 404 });
    }

    const formattedSurat = {
      ...item,
      lampiran: item.lampiran ? JSON.parse(item.lampiran) : [],
    };

    return NextResponse.json(formattedSurat);
  } catch (error: any) {
    console.error('Error fetching surat detail:', error);
    return NextResponse.json({ error: 'Failed to fetch surat detail' }, { status: 500 });
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

    const existing = await prisma.surat.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Surat not found' }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (body.nomor !== undefined) dataToUpdate.nomor = body.nomor;
    if (body.perihal !== undefined) dataToUpdate.perihal = body.perihal;
    if (body.jenis !== undefined) dataToUpdate.jenis = body.jenis;
    if (body.status !== undefined) dataToUpdate.status = body.status;
    if (body.dari !== undefined) dataToUpdate.dari = body.dari;
    if (body.kepada !== undefined) dataToUpdate.kepada = body.kepada;
    if (body.tanggal !== undefined) dataToUpdate.tanggal = body.tanggal;
    if (body.isi_singkat !== undefined) dataToUpdate.isi_singkat = body.isi_singkat;
    if (body.lampiran !== undefined) dataToUpdate.lampiran = JSON.stringify(body.lampiran);
    if (body.disposisi_kepada !== undefined) dataToUpdate.disposisi_kepada = body.disposisi_kepada;
    if (body.disposisi_catatan !== undefined) dataToUpdate.disposisi_catatan = body.disposisi_catatan;

    const updated = await prisma.surat.update({
      where: { id },
      data: dataToUpdate,
    });

    // Record to AuditLog
    await prisma.auditLog.create({
      data: {
        user: session.user?.name || 'Anggota DPM',
        aksi: 'Memperbarui data surat',
        modul: 'Persuratan',
        detail: `Memperbarui surat ${updated.jenis}: "${updated.perihal}" (Nomor: ${updated.nomor}) (ID: ${id})`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    const formattedSurat = {
      ...updated,
      lampiran: updated.lampiran ? JSON.parse(updated.lampiran) : [],
    };

    return NextResponse.json(formattedSurat);
  } catch (error: any) {
    console.error('Error updating surat:', error);
    return NextResponse.json({ error: 'Failed to update surat' }, { status: 500 });
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
    const existing = await prisma.surat.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Surat not found' }, { status: 404 });
    }

    await prisma.surat.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        user: session.user?.name || 'Anggota DPM',
        aksi: 'Menghapus surat',
        modul: 'Persuratan',
        detail: `Menghapus surat ${existing.jenis}: "${existing.perihal}" (Nomor: ${existing.nomor}) (ID: ${id})`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    return NextResponse.json({ message: 'Surat berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting surat:', error);
    return NextResponse.json({ error: 'Failed to delete surat' }, { status: 500 });
  }
}
