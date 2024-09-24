/*
  Warnings:

  - Added the required column `id_order_level` to the `Reports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reports" ADD COLUMN     "id_order_level" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Reports" ADD CONSTRAINT "fk_report_orderLevel" FOREIGN KEY ("id_order_level") REFERENCES "OrderLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
