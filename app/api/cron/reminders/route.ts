import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendWhatsAppMessage } from '@/lib/notification';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Optional: protect this route with a cron secret token to prevent abuse
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
    }

    const now = new Date();
    
    // Fetch all scheduled sidangs that haven't finished or cancelled
    const sidangs = await prisma.sidang.findMany({
      where: {
        status: 'dijadwalkan',
      }
    });

    let remindersSent = 0;

    for (const sidang of sidangs) {
      if (!sidang.tanggal || !sidang.waktu_mulai) continue;

      // sidang.tanggal is typically YYYY-MM-DD
      // sidang.waktu_mulai is typically HH:mm
      const sidangDateStr = `${sidang.tanggal}T${sidang.waktu_mulai}:00`;
      const sidangDateTime = new Date(sidangDateStr);
      
      // Calculate time difference in minutes
      const diffMinutes = (sidangDateTime.getTime() - now.getTime()) / (1000 * 60);

      let reminderType = null;

      // Check if it's H-1 (between 23.5 and 24.5 hours from now) -> ~1440 minutes
      if (diffMinutes >= 1410 && diffMinutes <= 1470) {
        reminderType = 'H-1';
      } 
      // Check if it's H-30m (between 15 and 45 minutes from now) -> ~30 minutes
      else if (diffMinutes >= 15 && diffMinutes <= 45) {
        reminderType = 'H-30m';
      }

      if (reminderType) {
        const timeStr = `${sidang.tanggal} pukul ${sidang.waktu_mulai}`;
        const message = reminderType === 'H-1'
          ? `*REMINDER SIDANG H-1*\n\nMengingatkan bahwa besok akan ada Sidang "${sidang.judul}" pada ${timeStr} bertempat di ${sidang.lokasi}.\n\nMohon kehadiran seluruh peserta tepat waktu.`
          : `*REMINDER SIDANG H-30 MENIT*\n\nSidang "${sidang.judul}" akan segera dimulai dalam 30 menit (${timeStr}) di ${sidang.lokasi}.\n\nHarap segera bersiap.`;

        const groupId = process.env.WA_GROUP_ID;

        if (groupId) {
          // Send 1 message to the WhatsApp Group
          await sendWhatsAppMessage(groupId, message);
          remindersSent++;
        } else {
          // Fallback: Send to individual participants (Japri) if no WA_GROUP_ID is set
          const pesertaIds: string[] = JSON.parse(sidang.peserta || '[]');
          if (pesertaIds.length === 0) continue;

          const users = await prisma.user.findMany({
            where: {
              id: { in: pesertaIds },
              phone: { not: null },
            }
          });

          for (const user of users) {
            if (user.phone) {
              await sendWhatsAppMessage(user.phone, `Halo ${user.name},\n\n${message}`);
              remindersSent++;
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, remindersSent });
  } catch (error: any) {
    console.error('Error in cron reminder:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
