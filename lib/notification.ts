import { prisma } from '@/lib/db';
import { sendWhatsApp } from '@/lib/whatsapp';

/** Label modul yang ditampilkan di header pesan grup WhatsApp. */
const MODUL_LABEL: Record<string, string> = {
  sidang: '🏛️ Sidang',
  legislasi: '📜 Legislasi',
  aspirasi: '💬 Aspirasi',
  voting: '🗳️ Voting',
  pengumuman: '📢 Pengumuman',
  surat: '✉️ Persuratan',
  izin: '📝 Izin Kegiatan',
  pengawasan: '🔍 Pengawasan',
  lpj: '📊 LPJ',
  pemira: '🗳️ Pemira',
  referendum: '🗳️ Referendum',
  anggota: '👥 Keanggotaan',
};

/** Detail tambahan (key → value) yang ditampilkan sebagai bullet list di pesan WA. */
export type NotificationDetail = Record<string, string | number | null | undefined>;

/** URL dasar aplikasi untuk membuat tautan yang bisa diklik di WhatsApp. */
function getAppUrl(): string {
  // 1. Jika ada NEXT_PUBLIC_APP_URL yang eksplisit dan bukan localhost
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
  if (explicit && !explicit.includes('localhost') && !explicit.includes('127.0.0.1')) {
    return explicit;
  }

  // 2. Jika NEXTAUTH_URL adalah domain publik (bukan localhost)
  const nextAuth = process.env.NEXTAUTH_URL?.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
  if (nextAuth && !nextAuth.includes('localhost') && !nextAuth.includes('127.0.0.1')) {
    return nextAuth;
  }

  // 3. Jika berjalan di Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '')}`;
  }

  // 4. Default fallback ke domain resmi DPM ITB Riau agar selalu bisa diklik di WA
  return 'https://www.dpm-connect.my.id';
}

/** Ubah kode status (mis. "perlu_revisi") menjadi teks yang mudah dibaca ("Perlu Revisi"). */
export function statusLabel(status?: string | null): string {
  if (!status) return '-';
  return status
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Potong teks panjang agar pesan grup tetap ringkas. */
export function ringkas(text?: string | null, max = 700): string {
  if (!text) return '';
  const clean = String(text).replace(/<[^>]*>/g, '').trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}

/** Bentuk pesan WhatsApp grup dengan format seragam. */
export function formatGroupMessage({
  judul,
  pesan,
  jenis,
  link,
  detail,
}: {
  judul: string;
  pesan: string;
  jenis: string;
  link?: string | null;
  detail?: NotificationDetail;
}): string {
  const modul = MODUL_LABEL[jenis] || '📢 Info';
  const lines: string[] = [`*DPM ITB RIAU — ${modul}*`, '', `*${judul}*`, pesan];

  const detailLines = Object.entries(detail || {})
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
    .map(([k, v]) => `• *${k}:* ${v}`);
  if (detailLines.length) lines.push('', ...detailLines);

  if (link) {
    const base = getAppUrl();
    const full = /^https?:\/\//.test(link) ? link : base ? `${base}${link.startsWith('/') ? '' : '/'}${link}` : null;
    if (full) lines.push('', `🔗 ${full}`);
  }

  lines.push('', `_${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB_`);
  return lines.join('\n');
}

/**
 * Kirim pesan ke grup WhatsApp DPM (WA_GROUP_ID). Tidak pernah melempar error.
 */
export async function notifyGroup(args: {
  judul: string;
  pesan: string;
  jenis: string;
  link?: string | null;
  detail?: NotificationDetail;
}): Promise<boolean> {
  const groupId = process.env.WA_GROUP_ID?.trim();
  if (!groupId) return false;
  try {
    const result = await sendWhatsApp({ to: groupId, message: formatGroupMessage(args) });
    return result.success;
  } catch (e) {
    console.error('Failed to send notification to WA Group:', e);
    return false;
  }
}

/**
 * Creates an in-app notification in the database
 * 
 * @param judul Title of the notification
 * @param pesan Notification body text
 * @param jenis Type of notification ('sidang' | 'legislasi' | 'aspirasi' | 'voting' | 'pengumuman' | 'surat' | 'izin' | 'pengawasan' | 'lpj' | 'pemira' | 'referendum' | 'anggota')
 * @param link Optional relative link when the notification is clicked (e.g. '/dashboard/sidang/123')
 * @param detail Optional extra key/value info shown only in the WhatsApp group message
 * @param waGroup Set false to skip forwarding to the WhatsApp group (default: true)
 */
export async function createInAppNotification({
  judul,
  pesan,
  jenis,
  link = null,
  detail,
  waGroup = true,
}: {
  judul: string;
  pesan: string;
  jenis: string;
  link?: string | null;
  detail?: NotificationDetail;
  waGroup?: boolean;
}) {
  let saved = false;
  try {
    await prisma.notifikasi.create({
      data: {
        judul,
        pesan,
        jenis,
        is_read: false,
        tanggal: new Date().toISOString(),
        link,
      },
    });
    saved = true;
  } catch (error) {
    console.error('Failed to create in-app notification:', error);
  }

  // Automatically broadcast to WA Group if configured (tetap dikirim walau simpan DB gagal)
  if (waGroup) {
    await notifyGroup({ judul, pesan, jenis, link, detail });
  }

  return saved;
}

/**
 * Sends a WhatsApp message via Fonnte (delegates to lib/whatsapp).
 * Uses env FONNTE_TOKEN (fallback: WA_API_KEY).
 *
 * @param phone Target phone number (e.g., '08123456789' or '628123456789') or group ID ('xxx@g.us')
 * @param message The message text
 */
export async function sendWhatsAppMessage(phone: string, message: string) {
  const result = await sendWhatsApp({ to: phone, message });
  return result.success;
}
