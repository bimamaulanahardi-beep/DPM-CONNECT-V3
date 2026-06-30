import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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

    const list = await prisma.programKerjaBEM.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    const formattedList = list.map((item) => ({
      ...item,
      bukti_urls: item.bukti_urls ? JSON.parse(item.bukti_urls) : [],
    }));

    return NextResponse.json(formattedList);
  } catch (error: any) {
    console.error('Error fetching proker BEM:', error);
    return NextResponse.json({ error: 'Failed to fetch proker BEM' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user as any;
    if (user.role === 'mahasiswa') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      nama,
      divisi,
      deskripsi,
      target,
      tanggal_mulai,
      tanggal_selesai,
      status,
      progress_percentage,
      bukti_urls,
      skor_evaluasi,
      catatan_dpm,
      catatan_bem,
      penanggung_jawab,
    } = body;

    if (!nama || !divisi || !status || !penanggung_jawab) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = body.id || `PKBEM-${crypto.randomUUID().split('-')[0].toUpperCase()}`;

    const newProker = await prisma.programKerjaBEM.create({
      data: {
        id,
        nama,
        divisi,
        deskripsi: deskripsi || '',
        target: target || '',
        tanggal_mulai: tanggal_mulai || new Date().toISOString().split('T')[0],
        tanggal_selesai: tanggal_selesai || new Date().toISOString().split('T')[0],
        status,
        progress_percentage: Number(progress_percentage || 0),
        bukti_urls: bukti_urls ? JSON.stringify(bukti_urls) : null,
        skor_evaluasi: skor_evaluasi !== undefined ? Number(skor_evaluasi) : null,
        catatan_dpm: catatan_dpm || null,
        catatan_bem: catatan_bem || null,
        penanggung_jawab,
      },
    });

    // Record to AuditLog
    await prisma.auditLog.create({
      data: {
        user: session.user?.name || 'Anggota DPM',
        aksi: 'Membuat evaluasi proker BEM',
        modul: 'Pengawasan BEM',
        detail: `Membuat evaluasi proker BEM: "${nama}" (ID: ${id})`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    const formattedProker = {
      ...newProker,
      bukti_urls: newProker.bukti_urls ? JSON.parse(newProker.bukti_urls) : [],
    };

    return NextResponse.json(formattedProker, { status: 201 });
  } catch (error: any) {
    console.error('Error creating proker BEM:', error);
    return NextResponse.json({ error: 'Failed to create proker BEM' }, { status: 500 });
  }
}
