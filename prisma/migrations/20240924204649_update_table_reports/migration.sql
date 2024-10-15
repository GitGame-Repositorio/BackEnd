/*
  Warnings:

  - You are about to drop the column `id_order_level` on the `Reports` table. All the data in the column will be lost.
  - Added the required column `id_content` to the `Reports` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reports" DROP CONSTRAINT "fk_report_content";

-- AlterTable
ALTER TABLE "Reports" DROP COLUMN "id_order_level",
ADD COLUMN     "id_content" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Reports" ADD CONSTRAINT "fk_report_content" FOREIGN KEY ("id_content") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
