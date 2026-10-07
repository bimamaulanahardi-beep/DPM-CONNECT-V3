import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createInAppNotification, ringkas, statusLabel } from '@/lib/notification';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const list = await prisma.legislasi.findMany({
      orderBy: {
        tanggal_diajukan: 'desc',
      },
    });

    const formattedList = list.map((item) => ({
      ...item,
      tags: JSON.parse(item.tags || '[]'),
    }));

    return NextResponse.json(formattedList);
  } catch (error: any) {
    console.error('Error fetching legislasi:', error);
    return NextResponse.json({ error: 'Failed to fetch legislasi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user as any;
    if (user.role === 'mahasiswa') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      judul,
      jenis,
      status,
      komisi,
      pengaju,
      isi_ringkasan,
      konten,
      tags,
      sidang_id,
    } = body;

    if (!judul || !jenis || !status || !komisi || !pengaju || !isi_ringkasan) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = body.id || `LEG-${crypto.randomUUID().split('-')[0].toUpperCase()}`;

    const newLeg = await prisma.legislasi.create({
      data: {
        id,
        nomor: body.nomor || null,
        judul,
        jenis,
        status,
        komisi,
        pengaju,
        tanggal_diajukan: body.tanggal_diajukan || new Date().toISOString().split('T')[0],
        tanggal_disahkan: body.tanggal_disahkan || null,
        isi_ringkasan,
        konten: konten || null,
        tags: JSON.stringify(tags || []),
        revisi_ke: Number(body.revisi_ke || 0),
        approved_by: body.approved_by || null,
        sidang_id: sidang_id || null,
      },
    });

    // Record to AuditLog
    await prisma.auditLog.create({
      data: {
        user: session.user?.name || 'Anggota DPM',
        aksi: 'Mengajukan RUU baru',
        modul: 'Legislasi',
        detail: `Mengajukan RUU: "${judul}" (ID: ${id})`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    // Create Notification
    await createInAppNotification({
      judul: 'Draft Produk Legislasi Baru',
      pesan: `Draft "${judul}" telah diajukan dan menunggu pembahasan.`,
      jenis: 'legislasi',
      link: `/dashboard/legislasi/${id}`,
      detail: {
        Nomor: newLeg.nomor || '-',
        Jenis: statusLabel(jenis),
        Komisi: komisi,
        Pengaju: pengaju,
        Status: statusLabel(status),
        Ringkasan: ringkas(isi_ringkasan, 400),
      },
    });

    const formattedLeg = {
      ...newLeg,
      tags: JSON.parse(newLeg.tags),
    };

    return NextResponse.json(formattedLeg, { status: 201 });
  } catch (error: any) {
    console.error('Error creating legislasi:', error);
    return NextResponse.json({ error: 'Failed to create legislasi' }, { status: 500 });
  }
}
