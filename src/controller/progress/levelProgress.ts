import { NextFunction, Request, Response } from "express";
import { Privilegies, LevelProgressWhereInput } from "@prisma/client";
import { unauthorizedError } from "../../services/objError";
import { db } from "../../database/postgres";

const include = { level: true, chapterProgress: true, contentProgress: true };

export const handleAccessUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { userId, method } = req;

  const progress = await db.levelProgress.findFirst({
    where: { id },
    include,
  });

  if (req.adminAccess) return next();

  if (userId === progress?.chapterProgress.id_user) return next();
  if (method === "POST") {
    const chapterProgress = await db.chapterProgress.findFirst({
      where: { id: req.body?.id_chapter_progress },
    });
    if (!chapterProgress || chapterProgress.id_user === userId) return next();
  }

  throw unauthorizedError;
};

export const handleAccessAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;

  const admin = await db.admin.findUnique({
    where: { id_userLogged: userId },
    select: { id_userLogged: true, privilegies: true },
  });

  if (!admin) return next();
  const privilegies: Privilegies = admin.privilegies;

  if (!privilegies.canManageCRUDPlayer) throw unauthorizedError;

  req.adminAccess = true;
  next();
};

export const create = async (req: Request, res: Response) => {
  const { id, id_chapter_progress, id_level } = req.body;
  const id_user = req.userId;

  const level = await db.level.findUniqueOrThrow({
    where: { id: id_level },
    include: { chapter: true },
  });

  const id_chapter = level.chapter.id;

  const levelProgress = await db.levelProgress.create({
    data: {
      id,
      chapterProgress: {
        connectOrCreate: {
          create: {
            id_chapter,
            id_user,
          },
          where: {
            id: id_chapter_progress || "",
          },
        },
      },
      level: {
        connect: {
          id: id_level,
        },
      },
    },
  });

  res.status(201).json(levelProgress);
};

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const levelProgress = await db.levelProgress.findUniqueOrThrow({
    where: { id },
    include,
  });
  res.json(levelProgress);
};

export const getAll = async (req: Request, res: Response) => {
  const { id_user, ...query } = req.query;

  const objFilterUser = id_user ? { chapterProgress: { id_user } } : {};

  const filter: Partial<LevelProgressWhereInput> = {
    ...query,
    ...objFilterUser,
  };

  const levelProgress = await db.levelProgress.findMany({
    where: filter,
    include,
  });

  res.json(levelProgress);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const where = { id };

  await db.levelProgress.findUniqueOrThrow({ where });

  const levelProgress = await db.levelProgress.update({
    data: req.body,
    where,
    include,
  });
  res.status(203).json(levelProgress);
};

export const destroy = async (req: Request, res: Response) => {
  const { id } = req.params;
  const levelProgress = await db.levelProgress.delete({ where: { id } });
  res.status(204).json(levelProgress);
};
