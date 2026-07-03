import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const totalSidang = await prisma.sidang.count();
    
    const produkLegislasi = await prisma.legislasi.count({
      where: {
        status: {
          in: ['disahkan', 'diundangkan'],
        },
      },
    });

    const aspirasiMasuk = await prisma.aspirasi.count();

    const tindakLanjut = await prisma.aspirasi.count({
      where: {
        status: {
          in: ['ditindaklanjuti', 'selesai'],
        },
      },
    });

    return NextResponse.json({
      sidangTerlaksana: totalSidang,
      produkLegislasi,
      aspirasiMasuk,
      tindakLanjut,
    });
  } catch (error: any) {
    console.error('Error fetching public stats:', error);
    return NextResponse.json({
      sidangTerlaksana: 0,
      produkLegislasi: 0,
      aspirasiMasuk: 0,
      tindakLanjut: 0,
    });
  }
}
