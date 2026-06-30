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

    const list = await prisma.surat.findMany({
      orderBy: {
        tanggal: 'desc',
      },
    });

    const formattedList = list.map((item) => ({
      ...item,
      lampiran: item.lampiran ? JSON.parse(item.lampiran) : [],
    }));

    return NextResponse.json(formattedList);
  } catch (error: any) {
    console.error('Error fetching surat:', error);
    return NextResponse.json({ error: 'Failed to fetch surat' }, { status: 500 });
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
      nomor,
      perihal,
      jenis,
      status,
      dari,
      kepada,
      tanggal,
      isi_singkat,
      lampiran,
      disposisi_kepada,
      disposisi_catatan,
      created_by,
    } = body;

    if (!nomor || !perihal || !jenis || !status || !dari || !kepada) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = body.id || `SRT-${crypto.randomUUID().split('-')[0].toUpperCase()}`;

    const newSurat = await prisma.surat.create({
      data: {
        id,
        nomor,
        perihal,
        jenis,
        status,
        dari,
        kepada,
        tanggal: tanggal || new Date().toISOString().split('T')[0],
        isi_singkat: isi_singkat || '',
        lampiran: lampiran ? JSON.stringify(lampiran) : null,
        disposisi_kepada: disposisi_kepada || null,
        disposisi_catatan: disposisi_catatan || null,
        created_by: created_by || '1',
      },
    });

    // Record to AuditLog
    await prisma.auditLog.create({
      data: {
        user: session.user?.name || 'Anggota DPM',
        aksi: 'Mengarsipkan surat baru',
        modul: 'Persuratan',
        detail: `Mengarsipkan surat ${jenis}: "${perihal}" (Nomor: ${nomor}) (ID: ${id})`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    const formattedSurat = {
      ...newSurat,
      lampiran: newSurat.lampiran ? JSON.parse(newSurat.lampiran) : [],
    };

    return NextResponse.json(formattedSurat, { status: 201 });
  } catch (error: any) {
    console.error('Error creating surat:', error);
    return NextResponse.json({ error: 'Failed to create surat' }, { status: 500 });
  }
}
