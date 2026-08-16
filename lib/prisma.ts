import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("DATABASE_URL is not set in environment.");
  }

  if (typeof WebSocket === "undefined") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const wsModule = require("ws");
      neonConfig.webSocketConstructor = wsModule.default || wsModule;
    } catch {
      // Ignored if ws module is unavailable or running in edge
    }
  }

  const pool = new Pool({
    connectionString:
      connectionString ||
      "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  });
  pool.on("error", (err: Error) => {
    console.warn("[Prisma Neon Pool Error]:", err?.message || err);
  });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
