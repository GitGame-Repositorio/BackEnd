import { NextFunction, Request, Response } from "express";
import { Privilegies } from "@prisma/client";
import { db } from "../../db";

const include = { orderLevel: true, levelProgress: true };

export const handleAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { userId, method } = req;

  const objError = {
    status: 401,
    message: "Access denied. Protecting user privacy.",
  };

  const progress = await db.contentProgress.findFirst({
    where: { id },
    include: {
      ...include,
      levelProgress: { include: { capterProgress: true } },
    },
  });

  const idUserCapter = progress?.levelProgress?.capterProgress?.id_user;

  if (userId === idUserCapter) return next();
  if (method === "POST") {
    const levelProgress = await db.levelProgress.findFirst({
      where: { id: req.body?.id_level_progress },
      include: { capterProgress: true },
    });
    
    const idUserLevel = levelProgress?.capterProgress?.id_user;
    if (idUserLevel === userId) return next();
  }

  const admin = await db.admin.findUnique({
    where: { id_userLogged: userId },
    select: { id_userLogged: true, privilegies: true },
  });

  if (!admin) throw objError;
  const privilegies: Privilegies = admin.privilegies;

  if (!privilegies.canManageCRUDPlayer) throw objError;

  next();
};

export const create = async (req: Request, res: Response) => {
  const contentProgress = await db.contentProgress.create({ data: req.body });
  res.status(201).json(contentProgress);
};

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const contentProgress = await db.contentProgress.findUniqueOrThrow({
    where: { id },
  });
  res.json(contentProgress);
};

export const getAll = async (req: Request, res: Response) => {
  const contentProgress = await db.contentProgress.findMany({
    where: req.query,
  });
  res.json(contentProgress);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const where = { id };

  await db.contentProgress.findUniqueOrThrow({ where });

  const contentProgress = await db.contentProgress.update({
    data: req.body,
    where,
  });
  res.status(203).json(contentProgress);
};

export const destroy = async (req: Request, res: Response) => {
  const { id } = req.params;
  const contentProgress = await db.contentProgress.delete({ where: { id } });
  res.status(204).json(contentProgress);
};