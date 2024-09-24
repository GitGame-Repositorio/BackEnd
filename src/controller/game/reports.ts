import { NextFunction, Request, Response } from "express";
import { Privilegies } from "@prisma/client";
import { db } from "../../db";

const include = {
  user: { include: { userLogged: true } },
};

export const handleAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const privilegies: Privilegies = req.privilegies;

  const objError = {
    status: 401,
    message: "Access denied. Protecting reports privacy.",
  };

  if (!privilegies.canManageCRUDReports) throw objError;
  next();
};

export const create = async (req: Request, res: Response) => {
  const reports = await db.reports.create({ data: req.body, include });
  res.status(201).json(reports);
};

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const reports = await db.reports.findUniqueOrThrow({
    where: { id },
    include,
  });
  res.json(reports);
};

export const getAll = async (req: Request, res: Response) => {
  const { resolved } = req.query;
  const filter = {
    ...req.query,
    text: undefined,
    resolved: resolved && (resolved === "false" ? false : true),
  };
  const reports = await db.reports.findMany({ where: filter, include });
  res.json(reports);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const where = { id };

  await db.reports.findUniqueOrThrow({ where });

  const reports = await db.reports.update({ data: req.body, where, include });
  res.status(203).json(reports);
};

export const destroy = async (req: Request, res: Response) => {
  const { id } = req.params;
  const reports = await db.reports.delete({ where: { id } });
  res.status(204).json(reports);
};
