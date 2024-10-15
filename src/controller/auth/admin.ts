import { Request, Response } from "express";
import { Privilegies, UserWork } from "@prisma/client";

import { unauthorizedError } from "../../services/objError";
import { db } from "../../database/postgres";

const include = {
  userLogged: {
    include: {
      user: { include: { userWork: true } },
    },
  },
  privilegies: true,
};

const objResponse = (admin) => {
  const type = !admin.userLogged ? "anonymous" : "logged";
  const works = admin.userLogged.user.userWork.map(
    ({ work }: UserWork) => work
  );
  return {
    ...admin,
    ...admin.userLogged,
    ...admin.userLogged.user,
    admin: admin.privilegies,
    userLogged: undefined,
    password: undefined,
    works,
    type,
  };
};

export const create = async (req: Request, res: Response) => {
  const privilegies: Privilegies = req.privilegies;

  if (!privilegies?.canCreateAdmin) throw unauthorizedError;

  const { id_user, ...data } = req.body;

  const user = await db.admin.create({
    data: {
      userLogged: {
        connect: {
          id_user,
        },
      },
      privilegies: {
        create: data,
      },
    },
    include,
  });

  const response = objResponse(user);
  res.status(201).json(response);
};

export const getAll = async (req: Request, res: Response) => {
  const privilegies: Privilegies = req.privilegies;
  const { limit } = req?.query;

  if (!privilegies.canViewAllAdmin) throw unauthorizedError;

  const listUser = await db.admin.findMany({
    where: { privilegies: req.body },
    take: Number(limit) || 100,
    include,
  });

  res.json(listUser.map(objResponse));
};

export const getById = async (req: Request, res: Response) => {
  const privilegies: Privilegies = req.privilegies;
  const { id_user } = req.params;
  const userId = req.userId;

  if (userId !== id_user && !privilegies.canViewAllAdmin)
    throw unauthorizedError;

  const user = await db.admin.findUniqueOrThrow({
    where: { id_userLogged: id_user },
    include,
  });

  const response = objResponse(user);
  res.json(response);
};

export const update = async (req: Request, res: Response) => {
  const privilegies: Privilegies = req.privilegies;
  const { id_user } = req.params;
  const userId = req.userId;
  const where = { id_userLogged: id_user };

  if (userId !== id_user && !privilegies.canEditPrivilegiesAdmin)
    throw unauthorizedError;

  await db.admin.findUniqueOrThrow({ where });

  const { privilegies: updatePrivilegies, ...rest } = req.body;
  delete updatePrivilegies["id_user"];

  const { email, name, ...restUser } = rest;

  const user = await db.admin.update({
    data: {
      privilegies: {
        update: updatePrivilegies,
      },
      userLogged: {
        update: {
          email,
          name,
          user: {
            update: {
              ...restUser,
            },
          },
        },
      },
    },
    where,
    include,
  });

  const response = objResponse(user);
  res.status(203).json(response);
};

export const destroy = async (req: Request, res: Response) => {
  const privilegies: Privilegies = req.privilegies;
  const { id_user } = req.params;
  const userId = req.userId;

  if (userId !== id_user && !privilegies.canDeleteAdmin)
    throw unauthorizedError;

  const user = await db.admin.delete({ where: { id_userLogged: id_user } });
  res.status(204).json(user);
};
