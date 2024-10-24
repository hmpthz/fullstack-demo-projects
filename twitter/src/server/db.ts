import { PGlite } from '@electric-sql/pglite';
import { PrismaPGlite } from 'pglite-prisma-adapter';
import { PrismaClient, Prisma } from "@prisma/client";

import { env } from "../env";
import path from 'path';

const createPrismaClient = async () => {
  const opts: Prisma.PrismaClientOptions = {
    log: env.NODE_ENV === "development"
      ? ["query", "error", "warn"] : ["error"]
  };
  if (env.LOCAL_DB !== undefined) {
    const p = path.resolve(process.cwd(), 'prisma/pglite');
    const pglite = await PGlite.create(`file://${p}`);
    opts.adapter = new PrismaPGlite(pglite);
  }
  return new PrismaClient<object>(opts);
}

const globalForPrisma = globalThis as unknown as {
  prisma: Awaited<ReturnType<typeof createPrismaClient>> | undefined;
};

export const db = globalForPrisma.prisma ?? (await createPrismaClient());

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
