import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { createInAppNotification } from '@/lib/notification';

export const dynamic = 'force-dynamic';

// Public endpoint: allows external parties to submit a surat masuk without login
export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const nama_pengirim = formData.get('nama_pengirim') as string;
    const instansi = formData.get('instansi') as string;
    const email_pengirim = formData.get('email_pengirim') as string;
    const nomor_surat = formData.get('nomor_surat') as string;
    const perihal = formData.get('perihal') as string;
    const isi_singkat = formData.get('isi_singkat') as string;
    const tanggal = formData.get('tanggal') as string;
    const file = formData.get('file') as Blob | null;

    if (!nama_pengirim || !instansi || !perihal || !isi_singkat) {
      return NextResponse.json({ error: 'Data tidak lengkap. Nama, instansi, perihal, dan isi singkat wajib diisi.' }, { status: 400 });
    }

    let lampiranList: any[] = [];

    // Handle optional file upload
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());

      if (buffer.length > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'Ukuran file melebihi batas 10MB.' }, { status: 413 });
      }

      const allowedTypes = [
        'image/jpeg', 'image/png', 'application/pdf',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
      ];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: 'Jenis file tidak diizinkan. Hanya PDF, JPG, PNG, dan Word.' }, { status: 400 });
      }

      const originalName = (file as any).name || `surat-masuk-${Date.now()}.pdf`;
      const fileId = `${Date.now()}-${crypto.randomUUID().split('-')[0]}`;
      const base64Data = buffer.toString('base64');
      const dataUri = `data:${file.type};base64,${base64Data}`;

      // Store file in FileStorage
      await prisma.fileStorage.create({
        data: {
          fileId,
          filename: originalName,
          mimeType: file.type,
          sizeBytes: buffer.length,
          dataUri,
          uploadedBy: `Publik: ${nama_pengirim}`,
          tanggal: new Date().toISOString(),
        }
      });

      // Record lightweight audit log
      await prisma.auditLog.create({
        data: {
          user: `Publik: ${nama_pengirim}`,
          aksi: 'Mengunggah berkas lampiran',
          modul: 'Penyimpanan',
          detail: `Mengunggah lampiran surat ${originalName} (${fileId})`,
          ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
          tanggal: new Date().toISOString(),
        },
      });

      lampiranList = [{ 
        name: originalName, 
        url: `/api/file/${fileId}?name=${encodeURIComponent(originalName)}`,
        fileId
      }];
    }

    const id = `SRT-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
    const nomorAuto = nomor_surat || `EXT-${Date.now()}`;

    const newSurat = await prisma.surat.create({
      data: {
        id,
        nomor: nomorAuto,
        perihal,
        jenis: 'masuk',
        status: 'diterima',
        dari: `${nama_pengirim} (${instansi})`,
        kepada: 'DPM ITB Riau',
        tanggal: tanggal || new Date().toISOString().split('T')[0],
        isi_singkat,
        lampiran: lampiranList.length > 0 ? JSON.stringify(lampiranList) : null,
        disposisi_kepada: null,
        disposisi_catatan: `Pengirim: ${nama_pengirim} | Instansi: ${instansi} | Email: ${email_pengirim || '-'}`,
        created_by: 'public',
      },
    });

    // Record to AuditLog
    await prisma.auditLog.create({
      data: {
        user: `Publik: ${nama_pengirim}`,
        aksi: 'Mengirim surat masuk via portal publik',
        modul: 'Persuratan',
        detail: `Surat masuk dari "${instansi}" - "${perihal}" (ID: ${id})`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    // Create Notification
    await createInAppNotification({
      judul: 'Surat Masuk Baru',
      pesan: `Surat masuk dari ${instansi} perihal "${perihal}" menunggu untuk didisposisikan.`,
      jenis: 'surat',
      link: `/dashboard/surat`,
    });

    return NextResponse.json({
      success: true,
      message: 'Surat Anda berhasil terkirim dan sedang menunggu tinjauan DPM ITB Riau.',
      kode: id,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error submitting public surat:', error);
    return NextResponse.json({ error: 'Gagal mengirim surat. Silakan coba lagi.' }, { status: 500 });
  }
}
