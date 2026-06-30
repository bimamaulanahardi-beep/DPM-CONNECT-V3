export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user as any;
    if (user.role !== 'admin' && user.role !== 'pimpinan') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') || '50';
    
    let takeQuery = undefined;
    if (limit !== 'all') {
      takeQuery = parseInt(limit, 10) || 50;
    }

    const auditLogs = await prisma.auditLog.findMany({
      orderBy: {
        tanggal: 'desc',
      },
      take: takeQuery,
    });

    return NextResponse.json({ success: true, auditLogs });
  } catch (error: any) {
    console.error('Get audit logs error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch audit logs' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user as any;
    if (user.role !== 'admin' && user.role !== 'pimpinan') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Tanggal diperlukan untuk menghapus log' }, { status: 400 });
    }

    const deletedLogs = await prisma.auditLog.deleteMany({
      where: {
        tanggal: {
          startsWith: date,
        },
      },
    });

    // Record the deletion action itself
    await prisma.auditLog.create({
      data: {
        user: session.user?.name || 'Admin',
        aksi: 'Menghapus log aktivitas harian',
        modul: 'Audit Log',
        detail: `Menghapus ${deletedLogs.count} log aktivitas pada tanggal ${date}`,
        ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true, count: deletedLogs.count, message: `Berhasil menghapus log pada tanggal ${date}` });
  } catch (error: any) {
    console.error('Delete audit logs error:', error);
    return NextResponse.json({ error: error.message || 'Gagal menghapus audit logs' }, { status: 500 });
  }
}
