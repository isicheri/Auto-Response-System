import {PrismaClient} from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

// Re-export PrismaClient and all types
export { PrismaClient } from "@prisma/client";
export type * from "@prisma/client";

export default { prisma, PrismaClient };