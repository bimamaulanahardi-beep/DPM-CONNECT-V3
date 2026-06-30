export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { passwordOld, passwordNew } = await req.json();
    const currentUser = session.user as any;

    if (!passwordOld || !passwordNew) {
      return NextResponse.json({ error: 'Password lama dan password baru wajib diisi.' }, { status: 400 });
    }

    // Fetch user from DB to verify old password
    const dbUser = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    // Verify old password matches
    const isPasswordValid = await bcrypt.compare(passwordOld, dbUser.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Password lama yang Anda masukkan salah.' }, { status: 400 });
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordNew, salt);

    await prisma.user.update({
      where: { id: dbUser.id },
      data: { password: passwordHash },
    });

    // Record to AuditLog
    await prisma.auditLog.create({
      data: {
        user: dbUser.name,
        aksi: 'Mengubah password',
        modul: 'Keamanan',
        detail: `Berhasil mengubah password keamanan akun.`,
        ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengubah password.' }, { status: 500 });
  }
}
