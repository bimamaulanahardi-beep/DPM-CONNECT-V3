import { prisma } from '@/lib/db';

/**
 * Creates an in-app notification in the database
 * 
 * @param judul Title of the notification
 * @param pesan Notification body text
 * @param jenis Type of notification ('sidang' | 'legislasi' | 'aspirasi' | 'voting' | 'pengumuman' | 'surat')
 * @param link Optional relative link when the notification is clicked (e.g. '/dashboard/sidang/123')
 */
export async function createInAppNotification({
  judul,
  pesan,
  jenis,
  link = null
}: {
  judul: string;
  pesan: string;
  jenis: string;
  link?: string | null;
}) {
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

    // Automatically broadcast to WA Group if configured
    const groupId = process.env.WA_GROUP_ID;
    if (groupId) {
      const waMessage = `*INFO DPM ITB RIAU*\n\n*${judul}*\n${pesan}`;
      try {
        await sendWhatsAppMessage(groupId, waMessage);
      } catch (e) {
        console.error('Failed to auto-forward notification to WA Group:', e);
      }
    }

    return true;
  } catch (error) {
    console.error('Failed to create in-app notification:', error);
    return false;
  }
}

/**
 * Sends a WhatsApp message using a generic gateway provider
 * Assumes environment variables:
 * WA_API_URL: The endpoint URL to POST the message
 * WA_API_KEY: The authorization token or API key
 * 
 * Example for Fonnte:
 * WA_API_URL = "https://api.fonnte.com/send"
 * WA_API_KEY = "your-fonnte-token"
 * 
 * @param phone Target phone number (e.g., '08123456789' or '628123456789')
 * @param message The message text
 */
export async function sendWhatsAppMessage(phone: string, message: string) {
  const apiUrl = process.env.WA_API_URL;
  const apiKey = process.env.WA_API_KEY;

  if (!apiUrl || !apiKey) {
    console.warn('WhatsApp Gateway is not configured. Missing WA_API_URL or WA_API_KEY.');
    return false;
  }

  // Sanitize phone number (remove non-digits, ensure it starts with standard country code if needed)
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.substring(1);
  }
  
  // If the target has '@g.us', it's a WhatsApp Group ID, we shouldn't sanitize it into a strict phone number
  if (phone.includes('@g.us')) {
    cleanPhone = phone; // keep the original group ID
  }

  try {
    // This payload structure works for many generic providers like Fonnte
    // Adjust the payload if using a specific provider that requires different keys
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey, // Often used as Bearer or just raw token
      },
      body: JSON.stringify({
        target: cleanPhone,
        message: message,
      }),
    });

    if (!response.ok) {
      console.error(`WhatsApp API responded with status ${response.status}`);
      const text = await response.text();
      console.error('Response:', text);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    return false;
  }
}
