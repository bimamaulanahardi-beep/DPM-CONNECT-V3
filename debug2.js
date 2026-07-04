const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allLogs = await prisma.auditLog.count();
  console.log('Total audit logs in DB:', allLogs);
  const fileStorageLogs = await prisma.auditLog.count({ where: { detail: { contains: 'FILE_STORAGE' } } });
  console.log('Total FILE_STORAGE logs in DB:', fileStorageLogs);
}

main().catch(console.error).finally(() => prisma.$disconnect());
