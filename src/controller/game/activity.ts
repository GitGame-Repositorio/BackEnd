import { NextFunction, Request, Response } from "express";
import { Privilegies } from "@prisma/client";
import { db } from "../../db";
import { nextOrderLevel } from "../../services/numbers";

const include = {
  assessment: true,
  orderLevel: { include: { level: true } },
};

export const handleAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const privilegies: Privilegies = req.privilegies;

  const objError = {
    status: 401,
    message: "Access denied. Protecting activity privacy.",
  };

  if (!privilegies.canManageContentGame) throw objError;
  next();
};

export const create = async (req: Request, res: Response) => {
  const { id_level, title, order } = req.body;
  const orderNumber = order || (await nextOrderLevel(id_level));

  const activity = await db.activity.create({
    data: {
      assessment: {
        create: { title },
      },
      orderLevel: {
        create: { id_level, order: orderNumber },
      },
    },
    include,
  });

  res.status(201).json(activity);
};

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const activity = await db.activity.findUniqueOrThrow({
    where: { id_assessment: id },
    include,
  });
  res.json(activity);
};

export const getAll = async (req: Request, res: Response) => {
  const { title, order, id_level } = req.query;
  const filter = {
    assessment: { title },
    orderLevel: {
      id_level,
      order: order && Number(order),
    },
  };
  const activity = await db.activity.findMany({ where: filter, include });
  res.json(activity);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const where = { id_assessment: id };
  const { title, order, id_level } = req.body;

  await db.activity.findUniqueOrThrow({ where });

  const activity = await db.activity.update({
    data: {
      assessment: {
        update: { title },
      },
      orderLevel: {
        update: { order, id_level },
      },
    },
    where,
    include,
  });
  res.status(203).json(activity);
};

export const destroy = async (req: Request, res: Response) => {
  const { id } = req.params;
  const activity = await db.activity.delete({ where: { id_assessment: id } });
  res.status(204).json(activity);
};
