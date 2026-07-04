const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allLogs = await prisma.auditLog.findMany();
  console.log('All logs:', allLogs);
}

main().catch(console.error).finally(() => { prisma.$disconnect(); });
