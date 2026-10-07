import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createInAppNotification, ringkas, statusLabel } from '@/lib/notification';

export const dynamic = 'force-dynamic';

// GET — Ambil detail LPJ beserta seluruh sections
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const lpj = await prisma.laporanLPJ.findUnique({
      where: { id: params.id },
      include: {
        sections: {
          orderBy: { urutan: 'asc' }
        }
      }
    });

    if (!lpj) {
      return NextResponse.json({ error: 'Dokumen LPJ tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(lpj);
  } catch (error) {
    console.error('Error fetching LPJ detail:', error);
    return NextResponse.json({ error: 'Gagal memuat detail LPJ' }, { status: 500 });
  }
}

// PATCH — Perbarui dokumen LPJ dan sections
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    const allowedRoles = ['admin', 'pimpinan', 'ketua_komisi', 'anggota', 'bem'];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      judul,
      periode,
      lembaga,
      ketua,
      status,
      ringkasan,
      sections // array of { id?, judul, konten, urutan }
    } = body;

    const now = new Date().toISOString();

    const existing = await prisma.laporanLPJ.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Dokumen LPJ tidak ditemukan' }, { status: 404 });
    }

    const dataToUpdate: any = {
      updated_at: now,
    };
    if (judul !== undefined) dataToUpdate.judul = judul;
    if (periode !== undefined) dataToUpdate.periode = periode;
    if (lembaga !== undefined) dataToUpdate.lembaga = lembaga;
    if (ketua !== undefined) dataToUpdate.ketua = ketua;
    if (status !== undefined) dataToUpdate.status = status;
    if (ringkasan !== undefined) dataToUpdate.ringkasan = ringkasan;

    // Jika ada pembaruan sections: hapus yang lama dan insert ulang secara atomik
    if (Array.isArray(sections)) {
      await prisma.$transaction([
        prisma.lPJSection.deleteMany({
          where: { lpj_id: params.id }
        }),
        prisma.laporanLPJ.update({
          where: { id: params.id },
          data: {
            ...dataToUpdate,
            sections: {
              create: sections.map((s: any, idx: number) => ({
                judul: s.judul || `Bagian ${idx + 1}`,
                konten: s.konten || '',
                urutan: typeof s.urutan === 'number' ? s.urutan : idx + 1,
              }))
            }
          }
        })
      ]);
    } else {
      await prisma.laporanLPJ.update({
        where: { id: params.id },
        data: dataToUpdate,
      });
    }

    const result = await prisma.laporanLPJ.findUnique({
      where: { id: params.id },
      include: {
        sections: {
          orderBy: { urutan: 'asc' }
        }
      }
    });

    // Notifikasi grup WA
    if (result) {
      const lpjDetail = {
        Lembaga: result.lembaga,
        Periode: result.periode,
        Ketua: result.ketua,
        Status: statusLabel(result.status),
        'Jumlah Bagian': result.sections.length,
      };
      if (existing.status !== result.status && result.status === 'diterbitkan') {
        await createInAppNotification({
          judul: '📊 LPJ Diterbitkan',
          pesan: `${result.lembaga} telah mempublikasikan LPJ periode ${result.periode}: "${result.judul}".`,
          jenis: 'lpj',
          link: `/lpj/${result.id}`,
          detail: { ...lpjDetail, Ringkasan: ringkas(result.ringkasan, 500) },
        });
      } else if (existing.status !== result.status) {
        await createInAppNotification({
          judul: 'Status LPJ Diperbarui',
          pesan: `Status LPJ "${result.judul}" berubah dari ${statusLabel(existing.status)} menjadi ${statusLabel(result.status)}.`,
          jenis: 'lpj',
          link: `/dashboard/lpj/${result.id}`,
          detail: lpjDetail,
        });
      } else {
        await createInAppNotification({
          judul: 'Dokumen LPJ Diperbarui',
          pesan: `LPJ "${result.judul}" telah diperbarui oleh ${user.name || 'Anggota'}.`,
          jenis: 'lpj',
          link: `/dashboard/lpj/${result.id}`,
          detail: lpjDetail,
        });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating LPJ:', error);
    return NextResponse.json({ error: 'Gagal memperbarui LPJ' }, { status: 500 });
  }
}

// DELETE — Hapus dokumen LPJ
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== 'admin' && user.role !== 'pimpinan') {
      return NextResponse.json({ error: 'Hanya Admin atau Pimpinan yang dapat menghapus dokumen LPJ ini' }, { status: 403 });
    }

    const existing = await prisma.laporanLPJ.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Dokumen LPJ tidak ditemukan' }, { status: 404 });
    }

    await prisma.laporanLPJ.delete({
      where: { id: params.id },
    });

    await createInAppNotification({
      judul: 'Dokumen LPJ Dihapus',
      pesan: `LPJ "${existing.judul}" (${existing.lembaga}, periode ${existing.periode}) telah dihapus oleh ${user.name || 'Admin'}.`,
      jenis: 'lpj',
      detail: { 'Status Terakhir': statusLabel(existing.status) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting LPJ:', error);
    return NextResponse.json({ error: 'Gagal menghapus dokumen LPJ' }, { status: 500 });
  }
}
