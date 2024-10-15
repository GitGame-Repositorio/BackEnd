/*
  Warnings:

  - You are about to drop the column `exam_complete` on the `ChapterProgress` table. All the data in the column will be lost.
  - You are about to drop the column `number_order` on the `Content` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_level,numberOrder]` on the table `Content` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `numberOrder` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Content` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Content_id_level_number_order_key";

-- AlterTable
ALTER TABLE "ChapterProgress" DROP COLUMN "exam_complete",
ADD COLUMN     "examComplete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Content" DROP COLUMN "number_order",
ADD COLUMN     "numberOrder" INTEGER NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Content_id_level_numberOrder_key" ON "Content"("id_level", "numberOrder");
