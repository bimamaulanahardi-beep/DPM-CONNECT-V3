const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const leg = await prisma.legislasi.findUnique({ where: { id: 'LEG-930533F7' } });
  console.log('Legislasi:', leg);
  if (leg && leg.konten) {
    const match = leg.konten.match(/\/api\/file\/([^?]+)/);
    if (match) {
      const fileId = match[1];
      console.log('FileId:', fileId);
      const logs = await prisma.auditLog.findMany({ where: { detail: { contains: fileId } } });
      console.log('AuditLogs found:', logs.length);
      if(logs.length > 0) {
        console.log('Log detail snippet:', logs[0].detail.substring(0, 100));
      } else {
        // Try searching without fileId just in case
        console.log('Trying to find any audit log with type FILE_STORAGE');
        const anyLogs = await prisma.auditLog.findMany({ where: { aksi: 'Mengunggah berkas' }, take: 5 });
        console.log('Recent uploads:', anyLogs.length);
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
