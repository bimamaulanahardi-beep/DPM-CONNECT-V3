import { prisma } from '@/lib/db';
import { sendWhatsApp } from '@/lib/whatsapp';

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
