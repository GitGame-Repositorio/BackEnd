-- CreateEnum
CREATE TYPE "Appearance" AS ENUM ('LIGHT', 'DARK');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPENED', 'CLOSED', 'RESOLVED', 'REMOVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "picture" TEXT NOT NULL DEFAULT '/images/common.png',
    "language" TEXT NOT NULL DEFAULT 'portuguese',
    "appearance" "Appearance" NOT NULL DEFAULT 'LIGHT',

    CONSTRAINT "pk_user" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLogged" (
    "id_user" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(50),

    CONSTRAINT "pk_userLogeed" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "UserWork" (
    "id_user" TEXT NOT NULL,
    "work" VARCHAR(50) NOT NULL,

    CONSTRAINT "UserWork_pkey" PRIMARY KEY ("id_user","work")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id_userLogged" TEXT NOT NULL,

    CONSTRAINT "pk_admin" PRIMARY KEY ("id_userLogged")
);

-- CreateTable
CREATE TABLE "Privilegies" (
    "id" TEXT NOT NULL,
    "id_admin" TEXT NOT NULL,
    "canCreateAdmin" BOOLEAN NOT NULL DEFAULT false,
    "canDeleteAdmin" BOOLEAN NOT NULL DEFAULT false,
    "canViewAllAdmin" BOOLEAN NOT NULL DEFAULT false,
    "canEditPrivilegiesAdmin" BOOLEAN NOT NULL DEFAULT false,
    "canManageCRUDPlayer" BOOLEAN NOT NULL DEFAULT false,
    "canManageCRUDReports" BOOLEAN NOT NULL DEFAULT true,
    "canManageContentGame" BOOLEAN NOT NULL DEFAULT true,
    "canReorderContentGame" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "pk_privilegies" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reports" (
    "id" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "id_content" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPENED',

    CONSTRAINT "pk_report" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "numberOrder" SERIAL NOT NULL,
    "id_exam" TEXT,

    CONSTRAINT "pk_chapter" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Level" (
    "id" TEXT NOT NULL,
    "id_chapter" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "numberOrder" INTEGER NOT NULL,

    CONSTRAINT "pk_level" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "numberOrder" INTEGER NOT NULL,
    "id_level" TEXT NOT NULL,
    "id_content" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "pk_content" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChapterProgress" (
    "id" TEXT NOT NULL,
    "id_chapter" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "examComplete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "pk_chapterProgress" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LevelProgress" (
    "id" TEXT NOT NULL,
    "id_chapter_progress" TEXT NOT NULL,
    "id_level" TEXT NOT NULL,

    CONSTRAINT "pk_levelProgress" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentProgress" (
    "id" TEXT NOT NULL,
    "id_content" TEXT NOT NULL,
    "id_level_progress" TEXT NOT NULL,
    "timeInSeconds" INTEGER NOT NULL DEFAULT 0,
    "complete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "pk_contentProgress" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "index_user" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserLogged_email_key" ON "UserLogged"("email");

-- CreateIndex
CREATE INDEX "index_userLogged" ON "UserLogged"("id_user");

-- CreateIndex
CREATE INDEX "index_userWork" ON "UserWork"("id_user");

-- CreateIndex
CREATE INDEX "index_admin" ON "Admin"("id_userLogged");

-- CreateIndex
CREATE UNIQUE INDEX "Privilegies_id_admin_key" ON "Privilegies"("id_admin");

-- CreateIndex
CREATE INDEX "index_reports" ON "Reports"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_numberOrder_key" ON "Chapter"("numberOrder");

-- CreateIndex
CREATE INDEX "index_chapter" ON "Chapter"("id");

-- CreateIndex
CREATE INDEX "index_level" ON "Level"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Level_id_chapter_numberOrder_key" ON "Level"("id_chapter", "numberOrder");

-- CreateIndex
CREATE INDEX "index_content" ON "Content"("id", "id_level");

-- CreateIndex
CREATE UNIQUE INDEX "Content_id_content_key" ON "Content"("id_content");

-- CreateIndex
CREATE UNIQUE INDEX "Content_id_level_numberOrder_key" ON "Content"("id_level", "numberOrder");

-- CreateIndex
CREATE INDEX "index_chapterProgress" ON "ChapterProgress"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterProgress_id_chapter_id_user_key" ON "ChapterProgress"("id_chapter", "id_user");

-- CreateIndex
CREATE INDEX "index_levelProgress" ON "LevelProgress"("id");

-- CreateIndex
CREATE UNIQUE INDEX "LevelProgress_id_chapter_progress_id_level_key" ON "LevelProgress"("id_chapter_progress", "id_level");

-- CreateIndex
CREATE INDEX "index_contentProgress" ON "ContentProgress"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ContentProgress_id_content_id_level_progress_key" ON "ContentProgress"("id_content", "id_level_progress");

-- AddForeignKey
ALTER TABLE "UserLogged" ADD CONSTRAINT "fk_userLogged" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWork" ADD CONSTRAINT "fk_userWork" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "fk_admin" FOREIGN KEY ("id_userLogged") REFERENCES "UserLogged"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Privilegies" ADD CONSTRAINT "fk_privilegies_admin" FOREIGN KEY ("id_admin") REFERENCES "Admin"("id_userLogged") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reports" ADD CONSTRAINT "fk_report_user" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reports" ADD CONSTRAINT "fk_report_content" FOREIGN KEY ("id_content") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Level" ADD CONSTRAINT "fk_level_chapter" FOREIGN KEY ("id_chapter") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "fk_content_level" FOREIGN KEY ("id_level") REFERENCES "Level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterProgress" ADD CONSTRAINT "fk_chapterProgress_chapter" FOREIGN KEY ("id_chapter") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterProgress" ADD CONSTRAINT "fk_chapterProgress_user" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelProgress" ADD CONSTRAINT "fk_levelProgress_chapterProgress" FOREIGN KEY ("id_chapter_progress") REFERENCES "ChapterProgress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelProgress" ADD CONSTRAINT "fk_levelProgress_level" FOREIGN KEY ("id_level") REFERENCES "Level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentProgress" ADD CONSTRAINT "fk_contentProgress_levelProgress" FOREIGN KEY ("id_level_progress") REFERENCES "LevelProgress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentProgress" ADD CONSTRAINT "fk_contentProgress_content" FOREIGN KEY ("id_content") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
