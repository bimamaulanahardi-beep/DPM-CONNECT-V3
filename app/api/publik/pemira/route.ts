import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pemiraList = await prisma.pemiraEvent.findMany({
      where: {
        status: { in: ['aktif', 'selesai'] }
      },
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: { candidates: true, records: true }
        }
      }
    });

    return NextResponse.json(pemiraList);
  } catch (error: any) {
    console.error('Error fetching public Pemira events:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
