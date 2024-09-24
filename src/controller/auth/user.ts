import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { db } from "../../db";
import { validateEmail, validatePassword } from "../../services/validate";
import { UserWork } from "@prisma/client";

const include = {
  userLogged: {
    select: {
      email: true,
      name: true,
      admin: { select: { privilegies: true } },
    },
  },
  userWork: true,
};

const objResponse = (user) => {
  const works = user.userWork.map(({ work }: UserWork) => work);
  const type = !user.userLogged ? "anonymous" : "logged";
  const { privilegies } = user?.userLogged?.admin || {};
  return {
    ...user,
    ...user.userLogged,
    userLogged: undefined,
    anonymous: undefined,
    userWorks: undefined,
    user: undefined,
    admin: privilegies ? { ...privilegies, id: undefined } : undefined,
    works,
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
  const { email, name, password, ...userData } = req.body;
  const id = req.userId;
  const where = { id };

  await db.user.findUniqueOrThrow({ where });

  email && validateEmail(email);
  password && validatePassword(password);

  const update = {
    password: password ? await bcrypt.hash(password, 10) : undefined,
    email,
    name,
  };

  const user = await db.user.update({
    data: {
      ...userData,
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
  const filter = { where: { id } };
  await db.user.findUniqueOrThrow(filter);
  const user = await db.user.delete(filter);
  res.status(204).json(user);
};

export const updateWork = async (req: Request, res: Response) => {
  const { works } = req.body;
  const id = req.userId;
  const data = works?.map((item: string) => {
    return {
      id_user: id,
      work: item,
    };
  });
  await db.userWork.deleteMany({ where: { id_user: id } });
  const response = await db.userWork.createMany({ data });
  res.status(201).json(response);
};
