import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateTrackingCode } from '@/lib/utils';
import { createInAppNotification } from '@/lib/notification';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user as any;
    if (user.role === 'mahasiswa') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const list = await prisma.aspirasi.findMany({
      include: {
        timeline: {
          orderBy: {
            tanggal: 'asc',
          },
        },
      },
      orderBy: {
        tanggal_masuk: 'desc',
      },
    });

    return NextResponse.json(list);
  } catch (error: any) {
    console.error('Error fetching aspirasi:', error);
    return NextResponse.json({ error: 'Failed to fetch aspirasi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      judul,
      deskripsi,
      kategori,
      is_anonim,
      nama_pengaju,
      nim_pengaju,
      email_pengaju,
    } = body;

    if (!judul || !deskripsi || !kategori) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = body.id || `ASP-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
    const kode_tracking = body.kode_tracking || generateTrackingCode();
    const tanggal = new Date().toISOString().split('T')[0];

    // Create the aspiration
    const newAspirasi = await prisma.aspirasi.create({
      data: {
        id,
        kode_tracking,
        judul,
        deskripsi,
        kategori,
        status: 'diterima',
        is_anonim: Boolean(is_anonim),
        nama_pengaju: is_anonim ? null : (nama_pengaju || null),
        nim_pengaju: is_anonim ? null : (nim_pengaju || null),
        email_pengaju: is_anonim ? null : (email_pengaju || null),
        tanggal_masuk: tanggal,
        tanggal_update: tanggal,
        timeline: {
          create: {
            status: 'diterima',
            keterangan: 'Aspirasi diterima oleh sistem DPM',
            tanggal: tanggal,
          },
        },
      },
      include: {
        timeline: true,
      },
    });

    // Create Notification
    await createInAppNotification({
      judul: 'Aspirasi Baru Masuk',
      pesan: `Aspirasi dengan topik "${judul}" telah diterima dari ${is_anonim ? 'Anonim' : nama_pengaju}.`,
      jenis: 'aspirasi',
      link: `/dashboard/aspirasi/${id}`,
    });

    // Kirim Email ke Admin DPM
    try {
      const { sendEmail } = await import('@/lib/mailer');
      await sendEmail({
        to: process.env.EMAIL_USER || 'dpmitbriau@gmail.com',
        subject: `[Aspirasi Baru] ${judul}`,
        html: `
          <h2>Aspirasi Mahasiswa Baru</h2>
          <p><strong>Pengaju:</strong> ${is_anonim ? 'Anonim' : (nama_pengaju || 'Anonim')}</p>
          <p><strong>Kategori:</strong> ${kategori}</p>
          <p><strong>Judul:</strong> ${judul}</p>
          <p><strong>Isi Aspirasi:</strong><br/>${deskripsi}</p>
          <br/>
          <a href="${process.env.NEXTAUTH_URL}/dashboard/aspirasi/${id}" style="background-color: #f59e0b; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Buka Dashboard DPM</a>
        `
      });

      // Kirim Email ke Pengaju (Jika tidak anonim & punya email)
      if (!is_anonim && email_pengaju) {
        await sendEmail({
          to: email_pengaju,
          subject: `[DPM ITB Riau] Tanda Terima Aspirasi`,
          html: `
            <h2>Aspirasi Berhasil Dikirim</h2>
            <p>Halo ${nama_pengaju},</p>
            <p>Aspirasi Anda berjudul <strong>"${judul}"</strong> telah kami terima di DPM ITB Riau.</p>
            <p><strong>Kode Pelacakan Anda:</strong> ${kode_tracking}</p>
            <p>Anda bisa melacak status aspirasi ini melalui portal atau dashboard mahasiswa Anda.</p>
            <br/>
            <p>Salam,<br/>DPM ITB Riau</p>
          `
        });
      }
    } catch (e) {
      console.error('Email sending failed for aspirasi, but continuing...', e);
    }

    // Kirim Notifikasi WhatsApp ke Pengurus DPM
    const adminWA = process.env.ADMIN_WHATSAPP;
    if (adminWA) {
      try {
        const { sendWhatsApp } = await import('@/lib/whatsapp');
        await sendWhatsApp({
          to: adminWA,
          message: `*DPM CONNECT — Aspirasi Mahasiswa Baru*\n\nTerdapat aspirasi baru masuk:\n• *Judul:* ${judul}\n• *Kategori:* ${kategori}\n• *Dari:* ${is_anonim ? 'Anonim' : (nama_pengaju || 'Tidak diketahui')}\n• *Kode Lacak:* ${kode_tracking}\n\nSilakan buka dashboard DPM untuk meninjau dan merespons aspirasi ini.`
        });
      } catch (e) {
        console.error('WA Admin aspirasi error:', e);
      }
    }

    return NextResponse.json(newAspirasi, { status: 201 });
  } catch (error: any) {
    console.error('Error creating aspirasi:', error);
    return NextResponse.json({ error: 'Failed to create aspirasi' }, { status: 500 });
  }
}
