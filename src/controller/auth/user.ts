import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { db } from "../../db";

const include = {
  userLogged: {
    select: {
      email: true,
      name: true,
      admin: { select: { privilegies: true } },
    },
  },
};

const objResponse = (user) => {
  const type = !user.userLogged ? "anonymous" : "logged";
  return {
    ...user,
    ...user.userLogged,
    userLogged: undefined,
    anonymous: undefined,
    admin: user?.userLogged?.admin?.privilegies,
    type,
  };
};

export const updateImage = async (req: Request, res: Response) => {
  const id = req.userId;
  const { filename } = req.file;

  const picture = `/images/${filename}`;

  const user = await db.user.update({
    where: { id },
    data: { picture },
    include,
  });

  const response = objResponse(user);
  res.status(201).json(response);
};

export const getById = async (req: Request, res: Response) => {
  const id = req.userId;
  const user = await db.user.findUniqueOrThrow({
    where: { id },
    include,
  });

  const response = objResponse(user);
  res.json(response);
};

export const update = async (req: Request, res: Response) => {
  const { password } = req.body;
  const id = req.userId;
  const where = { id };

  await db.user.findUniqueOrThrow({ where });

  const update = {
    ...req.body,
    password: password ? await bcrypt.hash(password, 10) : undefined,
  };

  const user = await db.user.update({
    data: {
      userLogged: { update: { data: { ...update }, where: { id_user: id } } },
    },
    include,
    where,
  });

  const response = objResponse(user);
  res.status(203).json(response);
};

export const destroy = async (req: Request, res: Response) => {
  const id = req.userId;
  const user = await db.user.delete({ where: { id } });
  res.status(204).json(user);
};
