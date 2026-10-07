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

    // Notifikasi grup WA untuk setiap perubahan sidang
    const link = `/dashboard/sidang/${id}`;
    const statusBerubah = existing.status !== updated.status;
    const jadwalBerubah =
      existing.tanggal !== updated.tanggal ||
      existing.waktu_mulai !== updated.waktu_mulai ||
      existing.lokasi !== updated.lokasi ||
      (existing.link_daring || '') !== (updated.link_daring || '');
    const sidangDetail = {
      Jenis: statusLabel(updated.jenis),
      Jadwal: `${updated.tanggal} pukul ${updated.waktu_mulai}${updated.waktu_selesai ? ` - ${updated.waktu_selesai}` : ''}`,
      Lokasi: updated.lokasi,
      'Link Daring': updated.link_daring,
      Quorum: `${updated.quorum_achieved}% (minimal ${updated.quorum_required}%)`,
    };

    if (statusBerubah && updated.status === 'berlangsung') {
      await createInAppNotification({
        judul: 'Sidang Dimulai',
        pesan: `Sidang "${updated.judul}" saat ini sedang berlangsung.`,
        jenis: 'sidang',
        link,
        detail: sidangDetail,
      });
    } else if (statusBerubah && updated.status === 'selesai') {
      await createInAppNotification({
        judul: 'Sidang Selesai',
        pesan: `Sidang "${updated.judul}" telah selesai dilaksanakan.`,
        jenis: 'sidang',
        link,
        detail: {
          ...sidangDetail,
          Notulensi: updated.notulensi ? `\n${ringkas(updated.notulensi, 800)}` : undefined,
        },
      });
    } else if (statusBerubah && /batal|tunda/i.test(updated.status)) {
      await createInAppNotification({
        judul: /batal/i.test(updated.status) ? 'Sidang Dibatalkan' : 'Sidang Ditunda',
        pesan: `Sidang "${updated.judul}" ${/batal/i.test(updated.status) ? 'DIBATALKAN' : 'DITUNDA'}.`,
        jenis: 'sidang',
        link,
        detail: sidangDetail,
      });
    } else if (statusBerubah) {
      await createInAppNotification({
        judul: 'Status Sidang Diperbarui',
        pesan: `Status sidang "${updated.judul}" berubah dari ${statusLabel(existing.status)} menjadi ${statusLabel(updated.status)}.`,
        jenis: 'sidang',
        link,
        detail: sidangDetail,
      });
    } else if (jadwalBerubah) {
      await createInAppNotification({
        judul: 'Jadwal Sidang Diubah',
        pesan: `Terdapat perubahan jadwal/lokasi untuk sidang "${updated.judul}". Mohon perhatikan jadwal terbaru.`,
        jenis: 'sidang',
        link,
        detail: {
          'Jadwal Lama': `${existing.tanggal} pukul ${existing.waktu_mulai} — ${existing.lokasi}`,
          ...sidangDetail,
        },
      });
    } else if (body.quorum_achieved !== undefined && Number(body.quorum_achieved) !== existing.quorum_achieved) {
      await createInAppNotification({
        judul: 'Absensi Sidang Diperbarui',
        pesan: `Absensi/quorum sidang "${updated.judul}" telah diperbarui.`,
        jenis: 'sidang',
        link,
        detail: { Quorum: sidangDetail.Quorum },
      });
    } else if (body.notulensi !== undefined && body.notulensi !== existing.notulensi) {
      await createInAppNotification({
        judul: 'Notulensi Sidang Diperbarui',
        pesan: `Notulensi sidang "${updated.judul}" telah diperbarui.`,
        jenis: 'sidang',
        link,
        detail: { Notulensi: `\n${ringkas(updated.notulensi, 800)}` },
      });
    } else {
      await createInAppNotification({
        judul: 'Data Sidang Diperbarui',
        pesan: `Data sidang "${updated.judul}" telah diperbarui oleh ${session.user?.name || 'Anggota DPM'}.`,
        jenis: 'sidang',
        link,
        detail: sidangDetail,
      });
    }

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

    await createInAppNotification({
      judul: 'Sidang Dihapus',
      pesan: `Sidang "${existing.judul}" (${existing.tanggal} pukul ${existing.waktu_mulai}) telah dihapus dari jadwal oleh ${session.user?.name || 'Anggota DPM'}.`,
      jenis: 'sidang',
      detail: { Lokasi: existing.lokasi, 'Status Terakhir': statusLabel(existing.status) },
    });

    return NextResponse.json({ success: true, message: 'Sidang berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting sidang:', error);
    return NextResponse.json({ error: 'Failed to delete sidang' }, { status: 500 });
  }
}
