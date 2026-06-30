import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const list = await prisma.sidang.findMany({
      orderBy: {
        tanggal: 'desc',
      },
    });

    // Parse stringified JSON arrays
    const formattedList = list.map((item) => ({
      ...item,
      agenda: JSON.parse(item.agenda || '[]'),
      peserta: JSON.parse(item.peserta || '[]'),
    }));

    return NextResponse.json(formattedList);
  } catch (error: any) {
    console.error('Error fetching sidang:', error);
    return NextResponse.json({ error: 'Failed to fetch sidang' }, { status: 500 });
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
      judul,
      jenis,
      status,
      tanggal,
      waktu_mulai,
      waktu_selesai,
      lokasi,
      link_daring,
      komisi,
      agenda,
      peserta,
      quorum_required,
      quorum_achieved,
      created_by,
    } = body;

    if (!judul || !jenis || !status || !tanggal || !waktu_mulai || !lokasi) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate a unique ID if not provided
    const id = body.id || `SDG-${crypto.randomUUID().split('-')[0].toUpperCase()}`;

    const newSidang = await prisma.sidang.create({
      data: {
        id,
        judul,
        jenis,
        status,
        tanggal,
        waktu_mulai,
        waktu_selesai: waktu_selesai || null,
        lokasi,
        link_daring: link_daring || null,
        komisi: komisi || null,
        agenda: JSON.stringify(agenda || []),
        peserta: JSON.stringify(peserta || []),
        notulensi: body.notulensi || null,
        quorum_required: Number(quorum_required || 0),
        quorum_achieved: Number(quorum_achieved || 0),
        created_by: created_by || '1',
        created_at: new Date().toISOString().split('T')[0],
      },
    });

    // Record to AuditLog
    await prisma.auditLog.create({
      data: {
        user: session.user?.name || 'Anggota DPM',
        aksi: 'Membuat jadwal sidang baru',
        modul: 'Sidang DPM',
        detail: `Membuat sidang: "${judul}" (ID: ${id})`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    const formattedSidang = {
      ...newSidang,
      agenda: JSON.parse(newSidang.agenda),
      peserta: JSON.parse(newSidang.peserta),
    };

    return NextResponse.json(formattedSidang, { status: 201 });
  } catch (error: any) {
    console.error('Error creating sidang:', error);
    return NextResponse.json({ error: 'Failed to create sidang' }, { status: 500 });
  }
}
