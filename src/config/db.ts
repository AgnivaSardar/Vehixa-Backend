import { PrismaClient } from "../generated/prisma/client";
import { env } from "./env";

const isDev = env.NODE_ENV === "development";

declare global {
  var __vehixaPrisma__: PrismaClient | undefined;
}

export const prisma =
  globalThis.__vehixaPrisma__ ??
  new PrismaClient({
    accelerateUrl: env.DATABASE_URL,
    log: isDev ? ["query", "warn", "error"] : ["warn", "error"],
  });

if (isDev) {
  globalThis.__vehixaPrisma__ = prisma;
}
