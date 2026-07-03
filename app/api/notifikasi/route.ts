import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createInAppNotification } from '@/lib/notification';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Since notifications are global in this schema, we just fetch all of them
    // Ordered by newest first
    const list = await prisma.notifikasi.findMany({
      orderBy: {
        tanggal: 'desc',
      },
      take: 50, // Limit to 50 most recent notifications
    });

    return NextResponse.json(list);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user as any;
    if (user.role !== 'admin' && user.role !== 'pimpinan') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { judul, pesan, link } = body;

    if (!judul || !pesan) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Broadcast pengumuman
    const success = await createInAppNotification({
      judul,
      pesan,
      jenis: 'pengumuman',
      link: link || null,
    });

    if (!success) {
      return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        user: session.user?.name || 'Admin',
        aksi: 'Membuat Pengumuman Massal',
        modul: 'Notifikasi',
        detail: `Broadcast: "${judul}"`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true, message: 'Pengumuman berhasil disebarkan' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating pengumuman:', error);
    return NextResponse.json({ error: 'Failed to create pengumuman' }, { status: 500 });
  }
}
