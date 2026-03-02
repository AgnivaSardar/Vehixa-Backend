import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { env } from "./env";

const isDev = env.NODE_ENV === "development";

declare global {
  var __vehixaPrisma__: PrismaClient | undefined;
}

const connectionString = env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma =
  globalThis.__vehixaPrisma__ ??
  new PrismaClient({
    adapter,
    log: isDev ? ["query", "warn", "error"] : ["warn", "error"],
  });

if (isDev) {
  globalThis.__vehixaPrisma__ = prisma;
}
