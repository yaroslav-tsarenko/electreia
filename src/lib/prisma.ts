import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/**
 * Newer pg-connection-string versions warn when `sslmode=require|prefer|verify-ca`
 * is used without opting into libpq compatibility. We already want the current
 * behaviour, so we append `uselibpqcompat=true` if the connection URL doesn't
 * already carry it. See:
 * https://www.postgresql.org/docs/current/libpq-ssl.html
 */
function withLibpqCompat(url: string): string {
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("uselibpqcompat")) {
      parsed.searchParams.set("uselibpqcompat", "true");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

const rawConnectionString =
  process.env.DIRECT_URL ||
  "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable";

const connectionString = withLibpqCompat(rawConnectionString);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
