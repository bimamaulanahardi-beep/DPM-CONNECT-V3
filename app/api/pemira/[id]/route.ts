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

    const { id } = params;
    const event = await prisma.pemiraEvent.findUnique({
      where: { id },
      include: {
        candidates: {
          orderBy: { nomor_urut: 'asc' }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Pemira not found' }, { status: 404 });
    }

    // Periksa apakah user yang sedang login sudah pernah mem-vote
    const existingVote = await prisma.pemiraVoteRecord.findUnique({
      where: {
        pemira_id_user_nim: {
          pemira_id: id,
          user_nim: user.nim,
        }
      }
    });

    const responseData = {
      ...event,
      has_voted: !!existingVote,
      total_voters: event.candidates.reduce((sum: number, c: any) => sum + c.total_suara, 0)
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Error fetching Pemira detail:', error);
    return NextResponse.json({ error: 'Failed to fetch detail' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
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
    const body = await request.json();

    const existing = await prisma.pemiraEvent.findUnique({
      where: { id },
      include: {
        candidates: {
          orderBy: { nomor_urut: 'asc' }
        }
      }
    });
    if (!existing) {
      return NextResponse.json({ error: 'Pemira not found' }, { status: 404 });
    }

    const updated = await prisma.pemiraEvent.update({
      where: { id },
      data: {
        judul: body.judul !== undefined ? body.judul : undefined,
        deskripsi: body.deskripsi !== undefined ? body.deskripsi : undefined,
        status: body.status !== undefined ? body.status : undefined,
        total_dpt: body.total_dpt !== undefined ? parseInt(body.total_dpt) : undefined,
      },
      include: {
        candidates: {
          orderBy: { nomor_urut: 'asc' }
        }
      }
    });

    // Notifikasi grup WA
    const statusBerubah = body.status !== undefined && existing.status !== updated.status;
    const pemiraDetail = {
      Status: statusLabel(updated.status),
      'Total DPT': updated.total_dpt ? `${updated.total_dpt} pemilih` : undefined,
      Pelaksanaan: `${updated.tanggal_mulai} s.d ${updated.tanggal_selesai}`,
      'Diperbarui oleh': user.name || 'Admin',
    };

    if (statusBerubah && updated.status === 'aktif') {
      const paslonList = updated.candidates
        .map((c: any) => `   ${c.nomor_urut}. ${c.nama_ketua}${c.nama_wakil ? ` & ${c.nama_wakil}` : ''}`)
        .join('\n');
      await createInAppNotification({
        judul: 'Pemilihan Raya (Pemira) Dibuka',
        pesan: `Pemungutan suara Pemira "${updated.judul}" telah resmi dibuka. Silakan gunakan hak pilih Anda!`,
        jenis: 'pemira',
        link: `/pemira/${updated.id}`,
        detail: {
          ...pemiraDetail,
          Paslon: paslonList ? `\n${paslonList}` : undefined,
        },
      });
    } else if (statusBerubah && updated.status === 'selesai') {
      const totalSuaraMasuk = updated.candidates.reduce((sum: number, c: any) => sum + (c.total_suara || 0), 0);
      const hasilPaslon = updated.candidates
        .map((c: any) => `   ${c.nomor_urut}. ${c.nama_ketua}${c.nama_wakil ? ` & ${c.nama_wakil}` : ''}: ${c.total_suara || 0} suara`)
        .join('\n');
      await createInAppNotification({
        judul: 'Pemilihan Raya (Pemira) Ditutup',
        pesan: `Pemungutan suara Pemira "${updated.judul}" telah resmi ditutup.`,
        jenis: 'pemira',
        link: `/pemira/${updated.id}`,
        detail: {
          'Total Suara Masuk': `${totalSuaraMasuk} suara`,
          'Hasil Perolehan Suara': hasilPaslon ? `\n${hasilPaslon}` : 'Belum ada suara',
        },
      });
    } else if (statusBerubah) {
      await createInAppNotification({
        judul: 'Status Pemira Diperbarui',
        pesan: `Status Pemira "${updated.judul}" berubah dari ${statusLabel(existing.status)} menjadi ${statusLabel(updated.status)}.`,
        jenis: 'pemira',
        link: `/dashboard/pemira/${updated.id}`,
        detail: pemiraDetail,
      });
    } else {
      await createInAppNotification({
        judul: 'Data Pemira Diperbarui',
        pesan: `Informasi Pemira "${updated.judul}" telah diperbarui.`,
        jenis: 'pemira',
        link: `/dashboard/pemira/${updated.id}`,
        detail: pemiraDetail,
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating Pemira:', error);
    return NextResponse.json({ error: 'Failed to update Pemira' }, { status: 500 });
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
    const existing = await prisma.pemiraEvent.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Pemira not found' }, { status: 404 });
    }

    await prisma.pemiraEvent.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        user: session.user?.name || 'Anggota DPM',
        aksi: 'Menghapus Event Pemira',
        modul: 'Pemira',
        detail: `ID: ${id}`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    await createInAppNotification({
      judul: 'Event Pemira Dihapus',
      pesan: `Event Pemira "${existing.judul}" telah dihapus oleh ${user.name || 'Admin'}.`,
      jenis: 'pemira',
      detail: {
        'Status Terakhir': statusLabel(existing.status),
      },
    });

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting Pemira:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
