import { PrismaClient } from "@prisma/client";

// ---- GLOBAL (fix for hot reload) ----
declare global {
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient({
  log: ["query", "info", "warn", "error"],
  errorFormat: "pretty",
  });
}

export const prisma = global.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
export { PrismaClient };
export * from "@prisma/client";
