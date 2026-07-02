import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || "";

  // If using Turso/LibSQL (production on Vercel), use the LibSQL adapter
  // Turso URLs look like: libsql://pihu-cakes.turso.io
  if (databaseUrl.startsWith("libsql://")) {
    const adapter = new PrismaLibSQL({
      url: databaseUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN || "",
    });
    return new PrismaClient({ adapter, log: ["error", "warn"] });
  }

  // Local dev: use regular SQLite (file-based)
  return new PrismaClient({ log: ["error", "warn"] });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
