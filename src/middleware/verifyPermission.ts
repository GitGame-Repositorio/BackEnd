import { NextFunction, Request, Response } from "express";
import { db } from "../database/postgres";

export const verifyPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id_userLogged = req.userId;
  const user = await db.admin.findUnique({
    where: { id_userLogged },
    select: { id_userLogged: true, privilegies: true },
  });

  if (!user)
    throw {
      status: 401,
      message: "Router protect, necessity admin privileges",
    };

  req.privilegies = user.privilegies;
  next();
};
