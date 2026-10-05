export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * Menampilkan daftar grup WhatsApp yang diikuti nomor Fonnte (khusus admin/pimpinan).
 * Buka di browser setelah login: /api/admin/wa-groups
 * Salin nilai "id" (berakhiran @g.us) ke environment variable WA_GROUP_ID di Vercel.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin' && user.role !== 'pimpinan') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const token = (process.env.FONNTE_TOKEN || process.env.WA_API_KEY || '').trim().replace(/^["']|["']$/g, '');
  if (!token) {
    return NextResponse.json({ error: 'FONNTE_TOKEN belum diisi di environment Vercel' }, { status: 400 });
  }

  try {
    // 1. Minta Fonnte memperbarui daftar grup dari WhatsApp
    const fetchRes = await fetch('https://api.fonnte.com/fetch-group', {
      method: 'POST',
      headers: { Authorization: token },
      cache: 'no-store',
    });
    const fetchData = await fetchRes.json().catch(() => null);

    // 2. Ambil daftar grup
    const listRes = await fetch('https://api.fonnte.com/get-whatsapp-group', {
      method: 'POST',
      headers: { Authorization: token },
      cache: 'no-store',
    });
    const listData = await listRes.json().catch(() => null);

    return NextResponse.json({
      petunjuk: 'Salin nilai "id" grup yang diinginkan (berakhiran @g.us) ke WA_GROUP_ID di Vercel, lalu Redeploy.',
      WA_GROUP_ID_saat_ini: process.env.WA_GROUP_ID || 'KOSONG',
      refresh: fetchData,
      grup: listData?.data ?? listData,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Gagal menghubungi Fonnte' }, { status: 500 });
  }
}
