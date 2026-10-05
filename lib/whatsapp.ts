interface SendWhatsAppOptions {
  to: string;
  message: string;
}

export interface SendWhatsAppResult {
  success: boolean;
  reason?: string;
  data?: any;
}

const FONNTE_URL = 'https://api.fonnte.com/send';

/** Ambil token Fonnte dari environment (mendukung nama variabel lama). */
function getFonnteToken(): string | undefined {
  const raw = process.env.FONNTE_TOKEN || process.env.WA_API_KEY;
  return raw?.trim().replace(/^["']|["']$/g, '') || undefined;
}

/**
 * Normalisasi target:
 * - Grup WA (mengandung "@g.us") dibiarkan apa adanya.
 * - Nomor: hapus karakter non-digit, ubah awalan 0 / 8 menjadi 62.
 * - Mendukung banyak nomor dipisah koma.
 */
export function normalizeTarget(to: string): string {
  return to
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => {
      if (t.includes('@g.us')) return t;
      let n = t.replace(/\D/g, '');
      if (n.startsWith('0')) n = '62' + n.substring(1);
      else if (n.startsWith('8')) n = '62' + n;
      return n;
    })
    .join(',');
}

export const sendWhatsApp = async ({ to, message }: SendWhatsAppOptions): Promise<SendWhatsAppResult> => {
  const token = getFonnteToken();
  if (!token) {
    console.warn('[WhatsApp Gateway] FONNTE_TOKEN belum dikonfigurasi di environment.');
    return { success: false, reason: 'TOKEN_NOT_CONFIGURED' };
  }

  const target = to ? normalizeTarget(to) : '';
  if (!target) {
    return { success: false, reason: 'NO_RECIPIENT' };
  }

  try {
    // Fonnte resmi menggunakan form-data
    const form = new FormData();
    form.append('target', target);
    form.append('message', message);
    form.append('countryCode', '62');

    const res = await fetch(FONNTE_URL, {
      method: 'POST',
      headers: { Authorization: token },
      body: form,
      cache: 'no-store',
    });

    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    // PENTING: Fonnte mengembalikan HTTP 200 walau gagal, cek field `status`
    const ok = res.ok && data?.status === true;
    if (!ok) {
      console.error('[WhatsApp Gateway] Gagal kirim WA:', { target, response: data });
      return { success: false, reason: data?.reason || `HTTP_${res.status}`, data };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('[WhatsApp Gateway] Error saat mengirim pesan WA:', error);
    return { success: false, reason: error?.message || 'NETWORK_ERROR' };
  }
};
