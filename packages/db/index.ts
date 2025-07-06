// packages/db/index.ts
import { PrismaClient } from '@prisma/client';

// Extend the global type to include prisma
declare global {
  var prisma: PrismaClient | undefined;
}

// Create a singleton instance of PrismaClient
const prisma = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// In development, store the instance globally to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Ensure connections are closed on process exit
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma };
export default prisma;