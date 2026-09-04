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
    const uniqueFileName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Upload ke Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error: uploadError } = await supabase
        .storage
        .from('uploads')
        .upload(uniqueFileName, buffer, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        return NextResponse.json({ error: 'Gagal mengupload file ke penyimpanan cloud (Supabase).' }, { status: 500 });
      }

      const { data: { publicUrl } } = supabase
        .storage
        .from('uploads')
        .getPublicUrl(uniqueFileName);

      // Store a lightweight log in AuditLog
      await prisma.auditLog.create({
        data: {
          user: session.user?.name || 'Anggota DPM',
          aksi: 'Mengunggah berkas',
          modul: 'Penyimpanan',
          detail: `Mengunggah file ke Supabase: ${filename}`,
          ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
          tanggal: new Date().toISOString(),
        },
      });

      return NextResponse.json({ 
        success: true, 
        url: publicUrl,
        name: filename,
        sizeBytes: buffer.length
      });
    }

    // Fallback jika env Supabase belum diset (kembali ke Base64 Data URI)
    const base64Data = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64Data}`;
    const fileId = `${Date.now()}-${crypto.randomUUID().split('-')[0]}`;

    await prisma.fileStorage.create({
      data: {
        fileId,
        filename,
        mimeType: file.type,
        sizeBytes: buffer.length,
        dataUri,
        uploadedBy: session.user?.name || 'Anggota DPM',
        tanggal: new Date().toISOString(),
      }
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
