import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
      "Please set it in your .env file. Example:\n" +
      "DATABASE_URL=\"mysql://user:password@localhost:3306/papad_store\""
    );
  }
  return url;
}

function createPrismaClient(): PrismaClient {
  try {
    const url = getDatabaseUrl();
    return new PrismaClient({
      adapter: new PrismaMariaDb(url),
      log: ["error"],
      errorFormat: "pretty",
    });
  } catch (e) {
    console.error("[prisma]", (e as Error).message);
    return new PrismaClient({
      adapter: new PrismaMariaDb("mysql://localhost:3306/placeholder"),
      log: ["error"],
      errorFormat: "pretty",
    });
  }
}

const prismaClientSingleton = globalForPrisma.prisma ?? createPrismaClient();

export const prisma = prismaClientSingleton;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
