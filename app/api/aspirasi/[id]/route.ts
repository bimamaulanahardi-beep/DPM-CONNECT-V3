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
    const { id } = params;
    const item = await prisma.aspirasi.findFirst({
      where: {
        OR: [
          { id },
          { kode_tracking: id },
        ],
      },
      include: {
        timeline: {
          orderBy: {
            tanggal: 'asc',
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Aspirasi not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error: any) {
    console.error('Error fetching aspirasi detail:', error);
    return NextResponse.json({ error: 'Failed to fetch aspirasi detail' }, { status: 500 });
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

    const existing = await prisma.aspirasi.findFirst({
      where: {
        OR: [
          { id },
          { kode_tracking: id },
        ],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Aspirasi not found' }, { status: 404 });
    }

    const dataToUpdate: any = {};
    const tanggal = new Date().toISOString().split('T')[0];
    dataToUpdate.tanggal_update = tanggal;

    if (body.status !== undefined) dataToUpdate.status = body.status;
    if (body.catatan_tindak_lanjut !== undefined) dataToUpdate.catatan_tindak_lanjut = body.catatan_tindak_lanjut;
    if (body.petugas !== undefined) dataToUpdate.petugas = body.petugas;

    // Update aspirasi
    const updated = await prisma.aspirasi.update({
      where: { id: existing.id },
      data: dataToUpdate,
    });

    // Record to AuditLog
    await prisma.auditLog.create({
      data: {
        user: session.user?.name || 'Anggota DPM',
        aksi: 'Memperbarui status aspirasi',
        modul: 'Aspirasi',
        detail: `Memperbarui status aspirasi: "${updated.judul}" menjadi "${updated.status}" (ID: ${existing.id})`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    // If status changed or timeline update is requested, add timeline entry
    if (body.status !== undefined || body.keterangan_timeline !== undefined) {
      let keterangan = body.keterangan_timeline;
      if (!keterangan) {
        if (body.status === 'ditinjau') {
          keterangan = 'Tim Komisi III sedang meninjau aspirasi ini';
        } else if (body.status === 'ditindaklanjuti') {
          keterangan = body.catatan_tindak_lanjut || 'DPM sedang menindaklanjuti aspirasi ke pihak terkait';
        } else if (body.status === 'selesai') {
          keterangan = body.catatan_tindak_lanjut || 'Aspirasi selesai ditindaklanjuti';
        } else if (body.status === 'ditolak') {
          keterangan = body.catatan_tindak_lanjut || 'Aspirasi ditolak';
        } else {
          keterangan = `Status diperbarui menjadi ${body.status}`;
        }
      }

      await prisma.aspirasiTimeline.create({
        data: {
          aspirasi_id: existing.id,
          status: body.status || existing.status,
          keterangan,
          tanggal,
          petugas: body.petugas || existing.petugas || null,
        },
      });
    }

    // Get final updated aspirasi with timeline
    const finalAspirasi = await prisma.aspirasi.findUnique({
      where: { id: existing.id },
      include: {
        timeline: {
          orderBy: {
            tanggal: 'asc',
          },
        },
      },
    });

    // Notifikasi grup WA jika status / tindak lanjut berubah
    const statusBerubah = body.status !== undefined && body.status !== existing.status;
    const catatanBerubah =
      body.catatan_tindak_lanjut !== undefined && body.catatan_tindak_lanjut !== existing.catatan_tindak_lanjut;
    if (statusBerubah || catatanBerubah) {
      await createInAppNotification({
        judul: statusBerubah ? 'Status Aspirasi Diperbarui' : 'Tindak Lanjut Aspirasi Diperbarui',
        pesan: statusBerubah
          ? `Aspirasi "${updated.judul}" kini berstatus ${statusLabel(updated.status)}.`
          : `Catatan tindak lanjut aspirasi "${updated.judul}" telah diperbarui.`,
        jenis: 'aspirasi',
        link: `/dashboard/aspirasi/${existing.id}`,
        detail: {
          'Kode Lacak': existing.kode_tracking,
          Kategori: existing.kategori,
          'Status Lama': statusBerubah ? statusLabel(existing.status) : undefined,
          'Status Baru': statusLabel(updated.status),
          Petugas: updated.petugas || session.user?.name,
          'Tindak Lanjut': updated.catatan_tindak_lanjut ? ringkas(updated.catatan_tindak_lanjut, 500) : undefined,
        },
      });
    }

    return NextResponse.json(finalAspirasi);
  } catch (error: any) {
    console.error('Error updating aspirasi:', error);
    return NextResponse.json({ error: 'Failed to update aspirasi' }, { status: 500 });
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
    const existing = await prisma.aspirasi.findFirst({
      where: { OR: [{ id }, { kode_tracking: id }] },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Aspirasi not found' }, { status: 404 });
    }

    // Cascade delete: AspirasiTimeline records are deleted automatically (onDelete: Cascade)
    await prisma.aspirasi.delete({ where: { id: existing.id } });

    await prisma.auditLog.create({
      data: {
        user: session.user?.name || 'Anggota DPM',
        aksi: 'Menghapus aspirasi',
        modul: 'Aspirasi',
        detail: `Menghapus aspirasi: "${existing.judul}" (Kode: ${existing.kode_tracking}) (ID: ${existing.id})`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    await createInAppNotification({
      judul: 'Aspirasi Dihapus',
      pesan: `Aspirasi "${existing.judul}" telah dihapus oleh ${session.user?.name || 'Anggota DPM'}.`,
      jenis: 'aspirasi',
      detail: { 'Kode Lacak': existing.kode_tracking, Kategori: existing.kategori },
    });

    return NextResponse.json({ message: 'Aspirasi berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting aspirasi:', error);
    return NextResponse.json({ error: 'Failed to delete aspirasi' }, { status: 500 });
  }
}
