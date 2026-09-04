interface SendWhatsAppOptions {
  to: string;
  message: string;
}

export const sendWhatsApp = async ({ to, message }: SendWhatsAppOptions) => {
  const token = process.env.FONNTE_TOKEN;
  if (!token) {
    // Non-blocking log if token is not yet configured
    console.log('[WhatsApp Gateway] FONNTE_TOKEN belum dikonfigurasi di file environment.');
    return { success: false, reason: 'TOKEN_NOT_CONFIGURED' };
  }

  if (!to || !to.trim()) {
    return { success: false, reason: 'NO_RECIPIENT' };
  }

  try {
    const res = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: to.trim(),
        message,
        countryCode: '62',
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.warn('[WhatsApp Gateway] Respons API gagal:', data);
    }
    return { success: res.ok, data };
  } catch (error) {
    console.error('[WhatsApp Gateway] Terjadi kesalahan saat mengirim pesan WA:', error);
    return { success: false, error };
  }
};
