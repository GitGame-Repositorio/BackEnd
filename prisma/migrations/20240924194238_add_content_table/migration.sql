/*
  Warnings:

  - You are about to drop the column `id_order_level` on the `ContentProgress` table. All the data in the column will be lost.
  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Assessment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Exam` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Objective` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderLevel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subject` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id_content,id_level_progress]` on the table `ContentProgress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_content` to the `ContentProgress` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "fk_activity_assessment";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "fk_subject_orderLevel";

-- DropForeignKey
ALTER TABLE "ContentProgress" DROP CONSTRAINT "fk_contentProgress_orderLevel";

-- DropForeignKey
ALTER TABLE "Exam" DROP CONSTRAINT "fk_exam_assessment";

-- DropForeignKey
ALTER TABLE "Exam" DROP CONSTRAINT "fk_exam_chapter";

-- DropForeignKey
ALTER TABLE "Objective" DROP CONSTRAINT "fk_objective_assessment";

-- DropForeignKey
ALTER TABLE "OrderLevel" DROP CONSTRAINT "fk_orderLevel_level";

-- DropForeignKey
ALTER TABLE "Reports" DROP CONSTRAINT "fk_report_orderLevel";

-- DropForeignKey
ALTER TABLE "Subject" DROP CONSTRAINT "fk_subject_orderLevel";

-- DropIndex
DROP INDEX "ContentProgress_id_order_level_id_level_progress_key";

-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN     "id_exam" TEXT;

-- AlterTable
ALTER TABLE "ContentProgress" DROP COLUMN "id_order_level",
ADD COLUMN     "id_content" TEXT NOT NULL;

-- DropTable
DROP TABLE "Activity";

-- DropTable
DROP TABLE "Assessment";

-- DropTable
DROP TABLE "Exam";

-- DropTable
DROP TABLE "Objective";

-- DropTable
DROP TABLE "OrderLevel";

-- DropTable
DROP TABLE "Subject";

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "numberOrder" INTEGER NOT NULL,
    "id_level" TEXT NOT NULL,
    "id_content" TEXT NOT NULL,

    CONSTRAINT "pk_content" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "index_content" ON "Content"("id", "id_level");

-- CreateIndex
CREATE UNIQUE INDEX "Content_id_level_numberOrder_key" ON "Content"("id_level", "numberOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ContentProgress_id_content_id_level_progress_key" ON "ContentProgress"("id_content", "id_level_progress");

-- RenameForeignKey
ALTER TABLE "Reports" RENAME CONSTRAINT "fk_report_player" TO "fk_report_user";

-- AddForeignKey
ALTER TABLE "Reports" ADD CONSTRAINT "fk_report_content" FOREIGN KEY ("id_order_level") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "fk_content_level" FOREIGN KEY ("id_level") REFERENCES "Level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentProgress" ADD CONSTRAINT "fk_contentProgress_content" FOREIGN KEY ("id_content") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
