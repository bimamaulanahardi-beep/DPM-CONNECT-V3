export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createInAppNotification, statusLabel } from '@/lib/notification';

// Helper to check authorization
async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return { authorized: false, errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), session: null };
  }
  const user = session.user as any;
  if (user.role !== 'admin' && user.role !== 'pimpinan') {
    return { authorized: false, errorResponse: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), session };
  }
  return { authorized: true, errorResponse: null, session };
}

// GET all users
export async function GET(req: Request) {
  try {
    const { errorResponse } = await checkAuth();
    if (errorResponse) return errorResponse;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        nim: true,
        name: true,
        email: true,
        role: true,
        komisi: true,
        jabatan: true,
        avatar: true,
        phone: true,
        angkatan: true,
        prodi: true,
        // Exclude password for security
      },
      orderBy: [
        { role: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch users' }, { status: 500 });
  }
}

// POST create new user
export async function POST(req: Request) {
  try {
    const { errorResponse, session } = await checkAuth();
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { nim, name, email, role, komisi, jabatan, phone, angkatan, prodi, password } = body;

    if (!nim || !name || !email || !role) {
      return NextResponse.json({ error: 'NIM, Nama, Email, dan Peran wajib diisi.' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { nim },
    });

    if (existingUser) {
      return NextResponse.json({ error: `Pengguna dengan NIM ${nim} sudah terdaftar.` }, { status: 400 });
    }

    // Hash password
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    // Create user in DB
    const newUser = await prisma.user.create({
      data: {
        nim,
        name,
        email,
        password: passwordHash,
        role,
        komisi: komisi || null,
        jabatan: jabatan || null,
        avatar: defaultAvatar,
        phone: phone || null,
        angkatan: angkatan || null,
        prodi: prodi || null,
      },
    });

    // Record to AuditLog
    const currentUser = session?.user as any;
    await prisma.auditLog.create({
      data: {
        user: currentUser.name || 'Admin',
        aksi: 'Menambahkan pengguna baru',
        modul: 'Manajemen Pengguna',
        detail: `Menambahkan pengguna ${name} (NIM: ${nim}) sebagai ${role}.`,
        ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    // Create Notification
    await createInAppNotification({
      judul: 'Anggota Baru Bergabung',
      pesan: `${name} telah bergabung dalam sistem dengan peran ${statusLabel(role)}.`,
      jenis: 'anggota',
      link: `/dashboard/anggota`,
      detail: {
        Nama: name,
        NIM: nim,
        Peran: statusLabel(role),
        Komisi: komisi,
        Jabatan: jabatan,
        Prodi: prodi,
        Angkatan: angkatan,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        nim: newUser.nim,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 });
  }
}
