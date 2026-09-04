import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const BULAN_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    const { searchParams } = new URL(request.url);
    const nim = searchParams.get('nim') || user.nim;

    // 1. Core Counts
    const totalSidang = await prisma.sidang.count();
    const activeSidangCount = await prisma.sidang.count({
      where: { status: 'berlangsung' },
    });
    const legislasiProcessCount = await prisma.legislasi.count({
      where: {
        status: {
          in: ['diajukan', 'dibahas', 'direvisi'],
        },
      },
    });
    const aspirasiPendingCount = await prisma.aspirasi.count({
      where: {
        status: {
          in: ['diterima', 'ditinjau'],
        },
      },
    });
    const bemProkerActive = await prisma.programKerjaBEM.count({
      where: { status: 'berjalan' },
    });
    const activeVotingCount = await prisma.voting.count({
      where: { status: 'aktif' },
    });

    // 2. Recent Lists
    const rawRecentSidang = await prisma.sidang.findMany({
      take: 3,
      orderBy: {
        tanggal: 'desc',
      },
    });
    const recentSidang = rawRecentSidang.map((s) => ({
      ...s,
      agenda: JSON.parse(s.agenda || '[]'),
      peserta: JSON.parse(s.peserta || '[]'),
    }));

    const rawRecentProker = await prisma.programKerjaBEM.findMany({
      orderBy: {
        id: 'asc',
      },
    });
    const recentProker = rawRecentProker.slice(3, 6).map((p) => ({
      ...p,
      bukti_urls: p.bukti_urls ? JSON.parse(p.bukti_urls) : [],
    }));

    let recentAspirasi: any[] = [];
    if (user.role === 'mahasiswa') {
      recentAspirasi = await prisma.aspirasi.findMany({
        where: { nim_pengaju: nim },
        take: 5,
        orderBy: { tanggal_masuk: 'desc' },
      });
    } else {
      recentAspirasi = await prisma.aspirasi.findMany({
        take: 2,
        orderBy: { tanggal_masuk: 'desc' },
      });
    }

    // 3. Chart Data: Aspirasi per bulan (6 bulan terakhir) dari database nyata
    const now = new Date();
    const aspirasiBulanData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const bulanStr = BULAN_ID[d.getMonth()];
      const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      const total = await prisma.aspirasi.count({
        where: { tanggal_masuk: { startsWith: prefix } },
      });
      const ditindaklanjuti = await prisma.aspirasi.count({
        where: {
          tanggal_masuk: { startsWith: prefix },
          status: { in: ['ditindaklanjuti', 'selesai'] },
        },
      });
      aspirasiBulanData.push({ bulan: bulanStr, total, ditindaklanjuti });
    }

    // 4. Chart Data: Kehadiran sidang per bulan (6 bulan terakhir) dari database nyata
    const kehadiranSidangData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const bulanStr = BULAN_ID[d.getMonth()];
      const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      const sidangBulan = await prisma.sidang.findMany({
        where: { tanggal: { startsWith: prefix } },
        select: { quorum_achieved: true, quorum_required: true },
      });

      let persentase = 0;
      const jumlah_sidang = sidangBulan.length;
      if (jumlah_sidang > 0) {
        const totalPct = sidangBulan.reduce((acc, s) => {
          const req = s.quorum_required > 0 ? s.quorum_required : 100;
          return acc + Math.min(100, Math.round((s.quorum_achieved / req) * 100));
        }, 0);
        persentase = Math.round(totalPct / jumlah_sidang);
      }
      kehadiranSidangData.push({ bulan: bulanStr, persentase, jumlah_sidang });
    }

    // 5. Chart Data: Status Program Kerja BEM (Pie Chart)
    const prokerStatusDataRaw = await prisma.programKerjaBEM.groupBy({
      by: ['status'],
      _count: { status: true }
    });
    const prokerStatusData = prokerStatusDataRaw.map(item => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: item._count.status
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalSidang,
        activeSidangCount,
        legislasiProcessCount,
        aspirasiPendingCount,
        bemProkerActive,
        activeVotingCount,
      },
      recentSidang,
      recentProker,
      recentAspirasi,
      aspirasiBulanData,
      kehadiranSidangData,
      prokerStatusData,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
