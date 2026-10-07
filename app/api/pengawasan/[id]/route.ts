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
    const item = await prisma.programKerjaBEM.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: 'Proker not found' }, { status: 404 });
    }

    const formattedProker = {
      ...item,
      bukti_urls: item.bukti_urls ? JSON.parse(item.bukti_urls) : [],
    };

    return NextResponse.json(formattedProker);
  } catch (error: any) {
    console.error('Error fetching proker detail:', error);
    return NextResponse.json({ error: 'Failed to fetch proker detail' }, { status: 500 });
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

    const existing = await prisma.programKerjaBEM.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Proker not found' }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (body.nama !== undefined) dataToUpdate.nama = body.nama;
    if (body.divisi !== undefined) dataToUpdate.divisi = body.divisi;
    if (body.deskripsi !== undefined) dataToUpdate.deskripsi = body.deskripsi;
    if (body.target !== undefined) dataToUpdate.target = body.target;
    if (body.tanggal_mulai !== undefined) dataToUpdate.tanggal_mulai = body.tanggal_mulai;
    if (body.tanggal_selesai !== undefined) dataToUpdate.tanggal_selesai = body.tanggal_selesai;
    if (body.status !== undefined) dataToUpdate.status = body.status;
    if (body.progress_percentage !== undefined) dataToUpdate.progress_percentage = Number(body.progress_percentage);
    if (body.bukti_urls !== undefined) dataToUpdate.bukti_urls = JSON.stringify(body.bukti_urls);
    if (body.skor_evaluasi !== undefined) dataToUpdate.skor_evaluasi = body.skor_evaluasi === null ? null : Number(body.skor_evaluasi);
    if (body.catatan_dpm !== undefined) dataToUpdate.catatan_dpm = body.catatan_dpm;
    if (body.catatan_bem !== undefined) dataToUpdate.catatan_bem = body.catatan_bem;
    if (body.penanggung_jawab !== undefined) dataToUpdate.penanggung_jawab = body.penanggung_jawab;

    const updated = await prisma.programKerjaBEM.update({
      where: { id },
      data: dataToUpdate,
    });

    // Record to AuditLog
    await prisma.auditLog.create({
      data: {
        user: session.user?.name || 'Anggota DPM',
        aksi: 'Memperbarui evaluasi proker BEM',
        modul: 'Pengawasan BEM',
        detail: `Memperbarui progres/skor proker BEM: "${updated.nama}" (Progres: ${updated.progress_percentage}%) (ID: ${id})`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    // Notifikasi grup WA
    const statusBerubah = body.status !== undefined && existing.status !== updated.status;
    const progressBerubah = body.progress_percentage !== undefined && existing.progress_percentage !== updated.progress_percentage;
    const skorBerubah = body.skor_evaluasi !== undefined && existing.skor_evaluasi !== updated.skor_evaluasi;
    const catatanDpmBerubah = body.catatan_dpm !== undefined && existing.catatan_dpm !== updated.catatan_dpm;

    const prokerDetail = {
      Divisi: updated.divisi,
      'Penanggung Jawab': updated.penanggung_jawab,
      Progress: `${updated.progress_percentage}%${progressBerubah ? ` (sebelumnya ${existing.progress_percentage}%)` : ''}`,
      Status: statusLabel(updated.status),
      'Skor Evaluasi': updated.skor_evaluasi !== null && updated.skor_evaluasi !== undefined ? `${updated.skor_evaluasi} / 100` : undefined,
      'Catatan DPM': updated.catatan_dpm ? ringkas(updated.catatan_dpm, 400) : undefined,
      'Diperbarui oleh': session.user?.name || 'Anggota DPM',
    };

    if (statusBerubah) {
      await createInAppNotification({
        judul: 'Status Proker BEM Diperbarui',
        pesan: `Status proker "${updated.nama}" (${updated.divisi}) berubah menjadi ${statusLabel(updated.status)}.`,
        jenis: 'pengawasan',
        link: `/dashboard/pengawasan`,
        detail: prokerDetail,
      });
    } else if (skorBerubah || catatanDpmBerubah) {
      await createInAppNotification({
        judul: 'Evaluasi Proker BEM Diperbarui',
        pesan: `Evaluasi DPM untuk proker "${updated.nama}" (${updated.divisi}) telah diperbarui.`,
        jenis: 'pengawasan',
        link: `/dashboard/pengawasan`,
        detail: prokerDetail,
      });
    } else if (progressBerubah) {
      await createInAppNotification({
        judul: 'Progress Proker BEM Diperbarui',
        pesan: `Progress proker "${updated.nama}" (${updated.divisi}) kini mencapai ${updated.progress_percentage}%.`,
        jenis: 'pengawasan',
        link: `/dashboard/pengawasan`,
        detail: prokerDetail,
      });
    } else {
      await createInAppNotification({
        judul: 'Data Proker BEM Diperbarui',
        pesan: `Informasi proker "${updated.nama}" (${updated.divisi}) telah diperbarui.`,
        jenis: 'pengawasan',
        link: `/dashboard/pengawasan`,
        detail: prokerDetail,
      });
    }

    const formattedProker = {
      ...updated,
      bukti_urls: updated.bukti_urls ? JSON.parse(updated.bukti_urls) : [],
    };

    return NextResponse.json(formattedProker);
  } catch (error: any) {
    console.error('Error updating proker:', error);
    return NextResponse.json({ error: 'Failed to update proker' }, { status: 500 });
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
    const existing = await prisma.programKerjaBEM.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Proker not found' }, { status: 404 });
    }

    await prisma.programKerjaBEM.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        user: session.user?.name || 'Anggota DPM',
        aksi: 'Menghapus program kerja BEM',
        modul: 'Pengawasan BEM',
        detail: `Menghapus proker BEM: "${existing.nama}" - Divisi ${existing.divisi} (ID: ${id})`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    await createInAppNotification({
      judul: 'Program Kerja BEM Dihapus',
      pesan: `Proker BEM "${existing.nama}" (${existing.divisi}) telah dihapus dari sistem pengawasan oleh ${session.user?.name || 'Anggota DPM'}.`,
      jenis: 'pengawasan',
      detail: {
        Divisi: existing.divisi,
        'PJ Terakhir': existing.penanggung_jawab,
        'Status Terakhir': statusLabel(existing.status),
      },
    });

    return NextResponse.json({ message: 'Program kerja BEM berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting proker:', error);
    return NextResponse.json({ error: 'Failed to delete proker' }, { status: 500 });
  }
}
