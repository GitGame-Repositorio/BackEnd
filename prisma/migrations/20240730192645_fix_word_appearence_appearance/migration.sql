/*
  Warnings:

  - You are about to drop the column `appearence` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Appearance" AS ENUM ('LIGHT', 'DARK');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "appearence",
ADD COLUMN     "appearance" "Appearance" NOT NULL DEFAULT 'LIGHT';

-- DropEnum
DROP TYPE "Appearence";
