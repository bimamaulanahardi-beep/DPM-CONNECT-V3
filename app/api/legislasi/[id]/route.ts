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
    const { id } = params;
    const item = await prisma.legislasi.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: 'Legislasi not found' }, { status: 404 });
    }

    const formattedLeg = {
      ...item,
      tags: JSON.parse(item.tags || '[]'),
    };

    return NextResponse.json(formattedLeg);
  } catch (error: any) {
    console.error('Error fetching legislasi detail:', error);
    return NextResponse.json({ error: 'Failed to fetch legislasi detail' }, { status: 500 });
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

    const existing = await prisma.legislasi.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Legislasi not found' }, { status: 404 });
    }

    const dataToUpdate: any = {};

    if (body.nomor !== undefined) dataToUpdate.nomor = body.nomor;
    if (body.judul !== undefined) dataToUpdate.judul = body.judul;
    if (body.jenis !== undefined) dataToUpdate.jenis = body.jenis;
    if (body.status !== undefined) dataToUpdate.status = body.status;
    if (body.komisi !== undefined) dataToUpdate.komisi = body.komisi;
    if (body.pengaju !== undefined) dataToUpdate.pengaju = body.pengaju;
    if (body.tanggal_diajukan !== undefined) dataToUpdate.tanggal_diajukan = body.tanggal_diajukan;
    if (body.tanggal_disahkan !== undefined) dataToUpdate.tanggal_disahkan = body.tanggal_disahkan;
    if (body.isi_ringkasan !== undefined) dataToUpdate.isi_ringkasan = body.isi_ringkasan;
    if (body.konten !== undefined) dataToUpdate.konten = body.konten;
    if (body.tags !== undefined) dataToUpdate.tags = JSON.stringify(body.tags);
    if (body.revisi_ke !== undefined) dataToUpdate.revisi_ke = Number(body.revisi_ke);
    if (body.approved_by !== undefined) dataToUpdate.approved_by = body.approved_by;
    if (body.sidang_id !== undefined) dataToUpdate.sidang_id = body.sidang_id;

    const updated = await prisma.legislasi.update({
      where: { id },
      data: dataToUpdate,
    });

    // Record to AuditLog
    await prisma.auditLog.create({
      data: {
        user: session.user?.name || 'Anggota DPM',
        aksi: 'Memperbarui data RUU',
        modul: 'Legislasi',
        detail: `Memperbarui RUU: "${updated.judul}" (Status: ${updated.status}) (ID: ${id})`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    // Create Notification if it was revised
    if (updated.revisi_ke > existing.revisi_ke) {
      await createInAppNotification({
        judul: 'Draft RUU Direvisi',
        pesan: `Draft "${updated.judul}" telah direvisi (Revisi ke-${updated.revisi_ke}).`,
        jenis: 'legislasi',
        link: `/dashboard/legislasi/${id}`,
      });
    }

    const formattedLeg = {
      ...updated,
      tags: JSON.parse(updated.tags || '[]'),
    };

    return NextResponse.json(formattedLeg);
  } catch (error: any) {
    console.error('Error updating legislasi:', error);
    return NextResponse.json({ error: 'Failed to update legislasi' }, { status: 500 });
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

    const existing = await prisma.legislasi.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Legislasi not found' }, { status: 404 });
    }

    await prisma.legislasi.delete({
      where: { id },
    });

    // Record to AuditLog
    await prisma.auditLog.create({
      data: {
        user: session.user?.name || 'Anggota DPM',
        aksi: 'Menghapus data RUU',
        modul: 'Legislasi',
        detail: `Menghapus RUU: "${existing.judul}" (ID: ${id})`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true, message: 'Legislasi berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting legislasi:', error);
    return NextResponse.json({ error: 'Failed to delete legislasi' }, { status: 500 });
  }
}
