export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

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

// PUT update user details
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { errorResponse, session } = await checkAuth();
    if (errorResponse) return errorResponse;

    const { id } = params;
    const body = await req.json();
    const { nim, name, email, role, komisi, jabatan, phone, angkatan, prodi, password } = body;

    // Verify user exists
    const userToUpdate = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToUpdate) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    // Verify NIM is not taken by another user
    if (nim && nim !== userToUpdate.nim) {
      const existingUser = await prisma.user.findUnique({
        where: { nim },
      });
      if (existingUser) {
        return NextResponse.json({ error: `NIM ${nim} sudah digunakan oleh pengguna lain.` }, { status: 400 });
      }
    }

    // Build update object
    const updateData: any = {};
    if (nim) updateData.nim = nim;
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    
    // Allow setting fields to null/empty
    updateData.komisi = komisi !== undefined ? komisi : userToUpdate.komisi;
    updateData.jabatan = jabatan !== undefined ? jabatan : userToUpdate.jabatan;
    updateData.phone = phone !== undefined ? phone : userToUpdate.phone;
    updateData.angkatan = angkatan !== undefined ? angkatan : userToUpdate.angkatan;
    updateData.prodi = prodi !== undefined ? prodi : userToUpdate.prodi;

    // Handle password update if provided
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Update in DB
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Record to AuditLog
    const currentUser = session?.user as any;
    await prisma.auditLog.create({
      data: {
        user: currentUser.name || 'Admin',
        aksi: 'Memperbarui data pengguna',
        modul: 'Manajemen Pengguna',
        detail: `Memperbarui data pengguna ${updatedUser.name} (NIM: ${updatedUser.nim}).`,
        ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        nim: updatedUser.nim,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { errorResponse, session } = await checkAuth();
    if (errorResponse) return errorResponse;

    const { id } = params;
    const currentUser = session?.user as any;

    // Prevent self-deletion
    if (id === currentUser.id) {
      return NextResponse.json({ error: 'Anda tidak dapat menghapus akun Anda sendiri.' }, { status: 400 });
    }

    // Verify user exists
    const userToDelete = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    // Delete from DB
    await prisma.user.delete({
      where: { id },
    });

    // Record to AuditLog
    await prisma.auditLog.create({
      data: {
        user: currentUser.name || 'Admin',
        aksi: 'Menghapus pengguna',
        modul: 'Manajemen Pengguna',
        detail: `Menghapus pengguna ${userToDelete.name} (NIM: ${userToDelete.nim}).`,
        ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: 500 });
  }
}
