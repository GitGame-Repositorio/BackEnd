import { NextFunction, Request, Response } from "express";
import { Privilegies, ContentProgressWhereInput } from "@prisma/client";
import { db } from "../../db";
import { unauthorizedError } from "../../services/objError";

const include = { orderLevel: true, levelProgress: true };

export const handleAccessUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { userId, method } = req;

  if (req.adminAccess) return next();

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
    const { id_level_progress } = req.body;
    if (!id_level_progress) return next();

    const levelProgress = await db.levelProgress.findUnique({
      where: { id: id_level_progress },
      include: { capterProgress: true },
    });

    const idUserLevel = levelProgress?.capterProgress?.id_user;
    if (idUserLevel === userId) return next();
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

  if (!admin) {return next()};
  const privilegies: Privilegies = admin.privilegies;

  if (!privilegies.canManageCRUDPlayer) throw unauthorizedError;

  req.adminAccess = true;
  next();
};

export const create = async (req: Request, res: Response) => {
  const { id, id_order_level, id_level_progress, complete } = req.body;
  const id_user = req.userId;

  const orderLevel = await db.orderLevel.findUnique({
    where: { id: id_order_level },
    include: { level: { include: { capter: true } } },
  });

  const { id_capter } = orderLevel.level;

  const contentProgress = await db.contentProgress.create({
    data: {
      id,
      complete,
      orderLevel: {
        connect: { id: id_order_level },
      },
      levelProgress: {
        connectOrCreate: {
          create: {
            level: {
              connect: {
                id: orderLevel.id_level,
              },
            },
            capterProgress: {
              connectOrCreate: {
                create: { id_capter, id_user },
                where: { id_capter_id_user: { id_capter, id_user } },
              },
            },
          },
          where: {
            id: id_level_progress || "",
          },
        },
      },
    },
  });

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
  const { id_user } = req.query;

  const objFilterUser = id_user
    ? { levelProgress: { capterProgress: { id_user } } }
    : {};

  const filter: Partial<ContentProgressWhereInput> = {
    ...req.query,
    ...objFilterUser,
    id_user: undefined,
  };

  const contentProgress = await db.contentProgress.findMany({
    where: filter,
  });

  res.json(contentProgress);
};

export const getAllUser = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit);
  const { userId } = req;

  const filter = {
    levelProgress: { capterProgress: { id_user: userId } },
    ...req.query,
    limit: undefined,
  };

  const contentProgress = await db.contentProgress.findMany({
    where: filter,
    include,
    take: limit || 1000,
  });

  const response = limit == 1 ? contentProgress[0] : contentProgress;

  res.json(response);
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
