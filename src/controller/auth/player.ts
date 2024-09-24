import { NextFunction, Request, Response } from "express";
import { Privilegies, UserWork } from "@prisma/client";
import bcrypt from "bcrypt";

import { db } from "../../db";

const include = {
  user: { include: { userWork: true } },
  admin: true,
};

export const objResponse = (player) => {
  const works = player.user.userWork.map(({ work }: UserWork) => work);
  return {
    ...player,
    ...player.user,
    isAdmin: !!player.admin,
    user: undefined,
    type: "logged",
    works,
  };
};

export const handleAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id_user } = req.params;
  const { userId, method } = req;

  const objError = {
    status: 401,
    message: "Access denied. Protecting user privacy.",
  };

  if (userId === id_user) return next();

  const admin = await db.admin.findUnique({
    where: { id_userLogged: userId },
    include: { privilegies: true },
  });

  if (!admin) throw objError;
  const privilegies: Privilegies = admin.privilegies;

  if (!privilegies.canManageCRUDPlayer) throw objError;
  if (method === "GET" && !id_user && !privilegies.canManageCRUDPlayer)
    throw objError;

  next();
};

export const create = async (req: Request, res: Response) => {
  const user = await db.userLogged.create({
    data: req.body,
    include,
  });
  res.status(201).json(objResponse(user));
};

export const getById = async (req: Request, res: Response) => {
  const { id_user } = req.params;
  const user = await db.userLogged.findUniqueOrThrow({
    where: { id_user },
    include,
  });
  res.json(objResponse(user));
};

export const getAll = async (req: Request, res: Response) => {
  const user = await db.userLogged.findMany({ where: req.query, include });
  const response = user.map((obj) => objResponse(obj));
  res.json(response);
};

export const update = async (req: Request, res: Response) => {
  const { password: psw } = req.body;
  const { id_user } = req.params;
  const where = { id_user };

  const password = psw ? await bcrypt.hash(psw, 10) : undefined;

  const { name, email, ...rest } = req.body;

  await db.userLogged.findUniqueOrThrow({ where });

  const user = await db.userLogged.update({
    data: {
      name,
      email,
      password,
      user: {
        update: {
          ...rest,
        },
      },
    },
    where,
    include,
  });
  res.status(203).json(objResponse(user));
};

export const destroy = async (req: Request, res: Response) => {
  const { id_user } = req.params;
  const user = await db.user.delete({ where: { id: id_user } });
  res.status(204).json(user);
};

export const updateWork = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body.map((item: string) => {
    return {
      id_user: id,
      work: item,
    };
  });
  await db.userWork.deleteMany({ where: { id_user: id } });
  const response = await db.userWork.createMany({ data });
  res.status(201).json(response);
};
