import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pemiraList = await prisma.pemiraEvent.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: { candidates: true, records: true }
        }
      }
    });

    return NextResponse.json(pemiraList);
  } catch (error: any) {
    console.error('Error fetching Pemira events:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user as any;
    if (user.role !== 'admin' && user.role !== 'pimpinan') {
      return NextResponse.json({ error: 'Forbidden. Only admin/pimpinan can create Pemira.' }, { status: 403 });
    }

    const body = await request.json();
    const { judul, deskripsi, tanggal_mulai, tanggal_selesai, candidates, total_dpt } = body;

    if (!judul || !tanggal_mulai || !tanggal_selesai || !candidates || !Array.isArray(candidates)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create Event and Candidates in a transaction
    const newPemira = await prisma.pemiraEvent.create({
      data: {
        judul,
        deskripsi: deskripsi || '',
        status: 'draft',
        tanggal_mulai,
        tanggal_selesai,
        total_dpt: total_dpt ? parseInt(total_dpt) : 0,
        created_by: user.name,
        created_at: new Date().toISOString(),
        candidates: {
          create: candidates.map((c: any, index: number) => ({
            nomor_urut: index + 1,
            nama_ketua: c.nama_ketua,
            nama_wakil: c.nama_wakil || null,
            visi: c.visi,
            misi: c.misi,
            foto_url: c.foto_url || null,
          }))
        }
      },
      include: {
        candidates: true
      }
    });

    await prisma.auditLog.create({
      data: {
        user: user.name,
        aksi: 'Membuat Event Pemira Baru',
        modul: 'Pemira',
        detail: `Judul: ${judul} dengan ${candidates.length} Paslon`,
        ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
        tanggal: new Date().toISOString(),
      },
    });

    return NextResponse.json(newPemira, { status: 201 });
  } catch (error: any) {
    console.error('Error creating Pemira:', error);
    return NextResponse.json({ error: 'Failed to create Pemira' }, { status: 500 });
  }
}
