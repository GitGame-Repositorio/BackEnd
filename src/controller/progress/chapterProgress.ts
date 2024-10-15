import { NextFunction, Request, Response } from "express";
import { Privilegies } from "@prisma/client";
import { db } from "../../database/postgres";
import { unauthorizedError } from "../../services/objError";

const include = { user: true, chapter: true };

export const handleAccessUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { userId, method } = req;

  if (req.adminAccess) return next();

  const progress = await db.chapterProgress.findFirst({
    where: { id },
    include,
  });

  if (userId === progress?.user.id) return next();
  if (method === "POST" && userId === req.body?.id_user) return next();

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
  const chapterProgress = await db.chapterProgress.create({
    data: req.body,
    include,
  });
  res.status(201).json(chapterProgress);
};

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const chapterProgress = await db.chapterProgress.findUniqueOrThrow({
    where: { id },
    include,
  });
  res.json(chapterProgress);
};

export const getAll = async (req: Request, res: Response) => {
  const chapterProgress = await db.chapterProgress.findMany({
    where: { ...req.query },
    include,
  });
  res.json(chapterProgress);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const where = { id };

  await db.chapterProgress.findUniqueOrThrow({ where });

  const chapterProgress = await db.chapterProgress.update({
    data: req.body,
    where,
    include,
  });

  res.status(203).json(chapterProgress);
};

export const destroy = async (req: Request, res: Response) => {
  const { id } = req.params;
  const chapterProgress = await db.chapterProgress.delete({ where: { id } });
  res.status(204).json(chapterProgress);
};
