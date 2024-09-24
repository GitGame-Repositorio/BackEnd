/*
  Warnings:

  - You are about to drop the column `id_capter` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `id_capter` on the `Level` table. All the data in the column will be lost.
  - You are about to drop the column `id_capter_progress` on the `LevelProgress` table. All the data in the column will be lost.
  - You are about to drop the column `apparence` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Capter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CapterProgress` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id_chapter]` on the table `Exam` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_chapter,numberOrder]` on the table `Level` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_chapter_progress,id_level]` on the table `LevelProgress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_chapter` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_chapter` to the `Level` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_chapter_progress` to the `LevelProgress` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Appearence" AS ENUM ('LIGHT', 'DARK');

-- DropForeignKey
ALTER TABLE "CapterProgress" DROP CONSTRAINT "fk_capterProgress_capter";

-- DropForeignKey
ALTER TABLE "CapterProgress" DROP CONSTRAINT "fk_capterProgress_user";

-- DropForeignKey
ALTER TABLE "Exam" DROP CONSTRAINT "fk_exam_capter";

-- DropForeignKey
ALTER TABLE "Level" DROP CONSTRAINT "fk_level_capter";

-- DropForeignKey
ALTER TABLE "LevelProgress" DROP CONSTRAINT "fk_levelProgress_capterProgress";

-- DropIndex
DROP INDEX "Exam_id_capter_key";

-- DropIndex
DROP INDEX "Level_id_capter_numberOrder_key";

-- DropIndex
DROP INDEX "LevelProgress_id_capter_progress_id_level_key";

-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "id_capter",
ADD COLUMN     "id_chapter" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Level" DROP COLUMN "id_capter",
ADD COLUMN     "id_chapter" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LevelProgress" DROP COLUMN "id_capter_progress",
ADD COLUMN     "id_chapter_progress" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "apparence",
ADD COLUMN     "appearence" "Appearence" NOT NULL DEFAULT 'LIGHT';

-- DropTable
DROP TABLE "Capter";

-- DropTable
DROP TABLE "CapterProgress";

-- DropEnum
DROP TYPE "Apparence";

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "titleGroup" VARCHAR(50) NOT NULL,
    "numberOrder" SERIAL NOT NULL,

    CONSTRAINT "pk_chapter" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChapterProgress" (
    "id" TEXT NOT NULL,
    "id_chapter" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "exam_complete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "pk_chapterProgress" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_numberOrder_key" ON "Chapter"("numberOrder");

-- CreateIndex
CREATE INDEX "index_chapter" ON "Chapter"("id");

-- CreateIndex
CREATE INDEX "index_chapterProgress" ON "ChapterProgress"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterProgress_id_chapter_id_user_key" ON "ChapterProgress"("id_chapter", "id_user");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_id_chapter_key" ON "Exam"("id_chapter");

-- CreateIndex
CREATE UNIQUE INDEX "Level_id_chapter_numberOrder_key" ON "Level"("id_chapter", "numberOrder");

-- CreateIndex
CREATE UNIQUE INDEX "LevelProgress_id_chapter_progress_id_level_key" ON "LevelProgress"("id_chapter_progress", "id_level");

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "fk_exam_chapter" FOREIGN KEY ("id_chapter") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Level" ADD CONSTRAINT "fk_level_chapter" FOREIGN KEY ("id_chapter") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterProgress" ADD CONSTRAINT "fk_chapterProgress_chapter" FOREIGN KEY ("id_chapter") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterProgress" ADD CONSTRAINT "fk_chapterProgress_user" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelProgress" ADD CONSTRAINT "fk_levelProgress_chapterProgress" FOREIGN KEY ("id_chapter_progress") REFERENCES "ChapterProgress"("id") ON DELETE CASCADE ON UPDATE CASCADE;
