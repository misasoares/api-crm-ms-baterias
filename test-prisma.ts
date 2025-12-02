import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log('Successfully connected to database');
  } catch (e) {
    console.error('Error connecting to database:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
