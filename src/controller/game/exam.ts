import { NextFunction, Request, Response } from "express";
import { Exam, Privilegies } from "@prisma/client";
import { db } from "../../db";

const select = {
  id_assessment: true,
  description: true,
  assessment: true,
  id_chapter: true,
};

export const handleAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const privilegies: Privilegies = req.privilegies;

  const objError = {
    status: 401,
    message: "Access denied. Protecting exam privacy.",
  };

  if (!privilegies.canManageContentGame) throw objError;
  next();
};

export const create = async (req: Request, res: Response) => {
  const { title, description, id_chapter } = req.body;
  const exam = await db.exam.create({
    select,
    data: {
      description,
      assessment: {
        create: { title },
      },
      chapter: {
        connect: { id: id_chapter },
      },
    },
  });
  res.status(201).json(exam);
};

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const exam = await db.exam.findUniqueOrThrow({
    where: { id_assessment: id },
    select,
  });
  res.json(exam);
};

export const getAll = async (req: Request, res: Response) => {
  const filter: Partial<Exam> = {
    ...req.query,
    description: undefined,
  };
  const exam = await db.exam.findMany({ where: filter, select });
  res.json(exam);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const where = { id_assessment: id };

  await db.exam.findUniqueOrThrow({ where });

  const exam = await db.exam.update({ data: req.body, where, select });
  res.status(203).json(exam);
};

export const destroy = async (req: Request, res: Response) => {
  const { id } = req.params;
  const exam = await db.exam.delete({ where: { id_assessment: id }, select });
  res.status(204).json(exam);
};
