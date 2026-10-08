import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = params;
    
    const event = await prisma.pemiraEvent.findUnique({
      where: { id },
      include: {
        candidates: {
          orderBy: { nomor_urut: 'asc' }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: 'Pemira not found' }, { status: 404 });
    }

    const responseData = {
      ...event,
      total_voters: event.candidates.reduce((sum: number, c: any) => sum + c.total_suara, 0)
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Error fetching public Pemira detail:', error);
    return NextResponse.json({ error: 'Failed to fetch detail' }, { status: 500 });
  }
}
