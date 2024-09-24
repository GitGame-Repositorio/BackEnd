/*
  Warnings:

  - You are about to drop the `Assessement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "fk_activity_assessment";

-- DropForeignKey
ALTER TABLE "Exam" DROP CONSTRAINT "fk_exam_assessment";

-- DropForeignKey
ALTER TABLE "Objective" DROP CONSTRAINT "fk_objective_assessment";

-- DropTable
DROP TABLE "Assessement";

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,

    CONSTRAINT "pk_assessment" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "fk_exam_assessment" FOREIGN KEY ("id_assessment") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "fk_activity_assessment" FOREIGN KEY ("id_assessment") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objective" ADD CONSTRAINT "fk_objective_assessment" FOREIGN KEY ("id_assessment") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
