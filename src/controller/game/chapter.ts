import { NextFunction, Request, Response } from "express";
import { Chapter, Privilegies } from "@prisma/client";
import { db } from "../../db";

const include = {
  level: {
    include: {
      orderLevel: {
        include: { activity: { include: { assessment: true } }, subject: true },
      },
    },
  },
  exam: true,
};

export const handleAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const privilegies: Privilegies = req.privilegies;

  const objError = {
    status: 401,
    message: "Access denied. Protecting chapter privacy.",
  };

  if (!privilegies.canManageContentGame) throw objError;
  next();
};

export const create = async (req: Request, res: Response) => {
  const chapter = await db.chapter.create({
    data: req.body,
    include: { level: {} },
  });
  res.status(201).json(chapter);
};

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const chapter = await db.chapter.findUniqueOrThrow({
    where: { id },
    include,
  });
  res.json(chapter);
};

export const getAll = async (req: Request, res: Response) => {
  const { numberOrder } = req.query;
  const filter: Partial<Chapter> = {
    ...req.query,
    numberOrder: numberOrder && Number(numberOrder),
  };
  const chapter = await db.chapter.findMany({
    where: filter,
    include,
  });
  res.json(chapter);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const where = { id };

  await db.chapter.findUniqueOrThrow({ where });

  const chapter = await db.chapter.update({ data: req.body, where, include });
  res.status(203).json(chapter);
};

export const destroy = async (req: Request, res: Response) => {
  const { id } = req.params;
  const chapter = await db.chapter.delete({ where: { id } });
  res.status(204).json(chapter);
};
