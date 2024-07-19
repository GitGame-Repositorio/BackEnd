/*
  Warnings:

  - You are about to drop the column `resolved` on the `Reports` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Reports` table. All the data in the column will be lost.
  - You are about to drop the `Anonymous` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `description` to the `Reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Reports` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Apparence" AS ENUM ('LIGHT', 'DARK');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPENED', 'CLOSED', 'RESOLVED');

-- DropForeignKey
ALTER TABLE "Anonymous" DROP CONSTRAINT "fk_admin";

-- AlterTable
ALTER TABLE "ContentProgress" ADD COLUMN     "timeInSeconds" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Reports" DROP COLUMN "resolved",
DROP COLUMN "text",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'OPENED',
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "apparence" "Apparence" NOT NULL DEFAULT 'LIGHT',
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'portuguese';

-- DropTable
DROP TABLE "Anonymous";

-- CreateTable
CREATE TABLE "UserWork" (
    "id_user" TEXT NOT NULL,
    "work" VARCHAR(50) NOT NULL,

    CONSTRAINT "UserWork_pkey" PRIMARY KEY ("id_user","work")
);

-- RenameForeignKey
ALTER TABLE "UserLogged" RENAME CONSTRAINT "fk_admin" TO "fk_userLogged";

-- AddForeignKey
ALTER TABLE "UserWork" ADD CONSTRAINT "fk_userWork" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
