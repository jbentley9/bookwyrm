/**
 * Database configuration and Prisma client setup.
 * Creates a singleton instance of the Prisma client to be used throughout the application.
 * In development, the instance is stored in a global variable to prevent hot-reloading issues.
 */
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;