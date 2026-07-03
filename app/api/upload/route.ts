import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 
      'application/pdf', 
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Jenis file tidak diizinkan. Hanya menerima Gambar, PDF, Word, dan Excel.' }, { status: 400 });
    }

    const originalName = (file as any).name || `upload-${Date.now()}`;
    const filename = originalName;
    
    // Convert to Base64 Data URI for serverless/Vercel environments
    const base64Data = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64Data}`;

    // Generate a unique file ID for the download URL
    const fileId = `${Date.now()}-${crypto.randomUUID().split('-')[0]}`;

    // Store file data in AuditLog detail (as JSON) for retrieval
    // We use a separate storage mechanism via a dedicated file record
    await prisma.auditLog.create({
      data: {
        user: session.user?.name || 'Anggota DPM',
        aksi: 'Mengunggah berkas',
        modul: 'Penyimpanan',
        detail: JSON.stringify({
          type: 'FILE_STORAGE',
          fileId,
          filename,
          mimeType: file.type,
          sizeBytes: buffer.length,
          dataUri,
        }),
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      url: `/api/file/${fileId}?name=${encodeURIComponent(filename)}`,
      name: filename,
      fileId,
      sizeBytes: buffer.length
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
