/*
  Warnings:

  - You are about to drop the column `numberOrder` on the `Content` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_level,number_order]` on the table `Content` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `number_order` to the `Content` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Content_id_level_numberOrder_key";

-- AlterTable
ALTER TABLE "Content" DROP COLUMN "numberOrder",
ADD COLUMN     "number_order" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Content_id_level_number_order_key" ON "Content"("id_level", "number_order");
