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
    const groupId = process.env.WA_GROUP_ID;

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
          ? `*REMINDER SIDANG H-1*\n\nMengingatkan bahwa besok akan ada Sidang "${sidang.judul}" pada ${timeStr} bertempat di ${sidang.lokasi}.\n\nMohon kehadiran seluruh peserta tepat waktu.\n\n🔗 https://www.dpm-connect.my.id/dashboard/sidang`
          : `*REMINDER SIDANG H-30 MENIT*\n\nSidang "${sidang.judul}" akan segera dimulai dalam 30 menit (${timeStr}) di ${sidang.lokasi}.\n\nHarap segera bersiap.\n\n🔗 https://www.dpm-connect.my.id/dashboard/sidang`;

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

    // Process Kegiatan DPM Reminders
    const kegiatans = await prisma.kegiatanDPM.findMany({
      where: {
        status: 'dijadwalkan',
      }
    });

    for (const kegiatan of kegiatans) {
      if (!kegiatan.tanggal || !kegiatan.waktu_mulai) continue;

      const kegiatanDateStr = `${kegiatan.tanggal}T${kegiatan.waktu_mulai}:00`;
      const kegiatanDateTime = new Date(kegiatanDateStr);
      if (isNaN(kegiatanDateTime.getTime())) continue;

      const diffMinutes = (kegiatanDateTime.getTime() - now.getTime()) / (1000 * 60);

      // Check H-1 (within 24 hours down to 30 mins before)
      if (!kegiatan.notif_h1_sent && diffMinutes <= 1440 && diffMinutes > 30) {
        const timeStr = `${kegiatan.tanggal} pukul ${kegiatan.waktu_mulai}${kegiatan.waktu_selesai ? ` - ${kegiatan.waktu_selesai}` : ''} WIB`;
        const msg = `*🔔 PENGINGAT KEGIATAN DPM (H-1)*\n\n` +
          `Mengingatkan kepada seluruh anggota DPM ITB Riau, besok/dalam waktu dekat akan dilaksanakan kegiatan:\n\n` +
          `📌 *Nama Agenda:* ${kegiatan.nama}\n` +
          `📂 *Kategori:* ${kegiatan.kategori}\n` +
          `📅 *Waktu:* ${timeStr}\n` +
          `📍 *Lokasi:* ${kegiatan.lokasi || '-'}\n` +
          `👤 *PJ:* ${kegiatan.penanggung_jawab || '-'}\n` +
          (kegiatan.deskripsi ? `📝 *Deskripsi:* ${kegiatan.deskripsi}\n` : '') +
          `\nMohon kehadiran dan kesiapannya tepat waktu. Terima kasih! 🙏\n\n` +
          `🔗 Detail Kalender: https://www.dpm-connect.my.id/dashboard/kalender`;

        if (groupId) {
          await sendWhatsAppMessage(groupId, msg);
          remindersSent++;
        }

        await prisma.kegiatanDPM.update({
          where: { id: kegiatan.id },
          data: { notif_h1_sent: true }
        });
      }

      // Check Saat Waktu Tiba / H-30 Menit (within 30 mins before, or up to 60 mins after start time if not sent)
      if (!kegiatan.notif_mulai_sent && diffMinutes <= 30 && diffMinutes >= -60) {
        const timeStr = `${kegiatan.tanggal} pukul ${kegiatan.waktu_mulai}${kegiatan.waktu_selesai ? ` - ${kegiatan.waktu_selesai}` : ''} WIB`;
        const msg = `*⏰ PENGINGAT KEGIATAN DPM (WAKTU TIBA)*\n\n` +
          `Pemberitahuan kepada seluruh anggota DPM ITB Riau, agenda kegiatan berikut akan segera dimulai / sedang berlangsung:\n\n` +
          `📌 *Nama Agenda:* ${kegiatan.nama}\n` +
          `📂 *Kategori:* ${kegiatan.kategori}\n` +
          `⏰ *Waktu:* ${timeStr}\n` +
          `📍 *Lokasi:* ${kegiatan.lokasi || '-'}\n` +
          `👤 *PJ:* ${kegiatan.penanggung_jawab || '-'}\n` +
          (kegiatan.deskripsi ? `📝 *Deskripsi:* ${kegiatan.deskripsi}\n` : '') +
          `\nDiharapkan kehadiran seluruh pihak terkait di lokasi kegiatan. Terima kasih! 🙏\n\n` +
          `🔗 Detail Kalender: https://www.dpm-connect.my.id/dashboard/kalender`;

        if (groupId) {
          await sendWhatsAppMessage(groupId, msg);
          remindersSent++;
        }

        await prisma.kegiatanDPM.update({
          where: { id: kegiatan.id },
          data: { notif_mulai_sent: true }
        });
      }
    }

    return NextResponse.json({ success: true, remindersSent });
  } catch (error: any) {
    console.error('Error in cron reminder:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
