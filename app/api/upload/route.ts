import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate file size (max 10MB)
    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 413 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images and PDFs are allowed.' }, { status: 400 });
    }

    const originalName = (file as any).name || `upload-${Date.now()}`;
    const ext = originalName.substring(originalName.lastIndexOf('.'));
    // Prevent path traversal
    const filename = `${crypto.randomUUID()}${ext}`;
    
    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignore if it already exists
    }

    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Record to AuditLog
    await prisma.auditLog.create({
      data: {
        user: session.user?.name || 'Anggota DPM',
        aksi: 'Mengunggah berkas',
        modul: 'Penyimpanan',
        detail: `Mengunggah file: "${filename}" (${buffer.length} bytes)`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      url: `/uploads/${filename}`,
      name: filename,
      sizeBytes: buffer.length
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
