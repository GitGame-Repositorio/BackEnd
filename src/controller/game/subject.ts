import { NextFunction, Request, Response } from "express";
import { Privilegies, Subject } from "@prisma/client";
import { db } from "../../db";
import { nextOrderLevel } from "../../services/numbers";

const include = { orderLevel: { include: { level: true } } };

export const handleAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const privilegies: Privilegies = req.privilegies;

  const objError = {
    status: 401,
    message: "Access denied. Protecting subject privacy.",
  };

  if (!privilegies.canManageContentGame) throw objError;
  next();
};

export const create = async (req: Request, res: Response) => {
  const { title, text, id_level, order } = req.body;
  const numberOrder = order || (await nextOrderLevel(id_level));
  const subject = await db.subject.create({
    data: {
      title,
      text,
      orderLevel: {
        create: {
          order: numberOrder,
          id_level,
        },
      },
    },
    include,
  });
  res.status(201).json(subject);
};

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const subject = await db.subject.findUniqueOrThrow({
    where: { id },
    include,
  });
  res.json(subject);
};

export const getAll = async (req: Request, res: Response) => {
  const { title, order, id_level } = req.query;
  const filter = {
    title,
    orderLevel: {
      id_level,
      order: order && Number(order),
    },
  };
  const subject = await db.subject.findMany({ where: filter, include });
  res.json(subject);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const where = { id };

  const { title, order, id_level } = req.body;

  await db.subject.findUniqueOrThrow({ where });

  const subject = await db.subject.update({
    data: {
      title,
      orderLevel: {
        update: { order, id_level },
      },
    },
    where,
    include,
  });
  res.status(203).json(subject);
};

export const destroy = async (req: Request, res: Response) => {
  const { id } = req.params;
  const subject = await db.subject.delete({ where: { id } });
  res.status(204).json(subject);
};
