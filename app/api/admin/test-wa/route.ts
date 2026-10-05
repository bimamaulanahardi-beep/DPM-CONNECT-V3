export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sendWhatsApp } from '@/lib/whatsapp';

/**
 * Endpoint tes WhatsApp (khusus admin/pimpinan).
 * Buka di browser setelah login: /api/admin/test-wa
 * Opsional: ?to=group | ?to=admin | ?to=628xxxxxxxxxx
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'admin' && user.role !== 'pimpinan') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const toParam = searchParams.get('to');
  // Default: kirim ke grup jika WA_GROUP_ID terisi, selain itu ke ADMIN_WHATSAPP
  const to =
    toParam === 'group' || (!toParam && process.env.WA_GROUP_ID)
      ? process.env.WA_GROUP_ID || ''
      : toParam === 'admin' || !toParam
        ? process.env.ADMIN_WHATSAPP || ''
        : toParam;

  const result = await sendWhatsApp({
    to,
    message: `*DPM CONNECT — Tes Notifikasi*\n\nJika pesan ini masuk, berarti integrasi WhatsApp (Fonnte) sudah berjalan normal.\n\nWaktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`,
  });

  return NextResponse.json({
    config: {
      FONNTE_TOKEN: process.env.FONNTE_TOKEN ? `terisi (${process.env.FONNTE_TOKEN.trim().length} karakter)` : 'KOSONG',
      ADMIN_WHATSAPP: process.env.ADMIN_WHATSAPP || 'KOSONG',
      WA_GROUP_ID: process.env.WA_GROUP_ID || 'KOSONG',
    },
    target: to,
    result,
  });
}
