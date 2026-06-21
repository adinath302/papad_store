import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClientSingleton =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
    log: ["error"],
    errorFormat: "pretty",
  });

export const prisma = prismaClientSingleton;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}



