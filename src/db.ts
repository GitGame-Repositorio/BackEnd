import { PrismaClient } from "@prisma/client";

export const db: PrismaClient = new PrismaClient();

(async () => {
  await db.$connect();
  console.log("DB postgreSQL connect whit success");
})();
