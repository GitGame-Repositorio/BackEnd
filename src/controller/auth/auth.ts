import { Request, Response } from "express";
import { User, UserLogged } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { validateEmail, validatePassword } from "../../services/validate";
import { JWT_SECRET } from "../../env";
import { db } from "../../database/postgres";

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  validateEmail(email);
  // validatePassword(password);

  const hashPassword = await bcrypt.hash(password, 10);

  const data = {
    password: hashPassword,
    email,
  };

  const user = await db.user.create({
    data: { userLogged: { create: data } },
    include: {
      userLogged: {
        select: {
          email: true,
          name: true,
          admin: { select: { privilegies: true } },
        },
      },
    },
  });

  res.status(201).json({ ...user, ...user.userLogged, userLogged: undefined });
};

export const registerAnonymous = async (req: Request, res: Response) => {
  const user: Partial<User> = await db.user.create({ data: {} });
  const token = jwt.sign({ sub: user.id, type: "anonymous" }, JWT_SECRET, {
    algorithm: "HS256",
  });
  res.status(201).json({ ...user, token });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const objError = { status: 401, message: "email or password incorrect" };

  if (!email) throw new Error("Argument `email` is missing");
  if (!password) throw new Error("Argument `password` is missing");

  const userLogged = await db.userLogged.findUnique({
    where: { email },
    include: { admin: true },
  });
  if (!userLogged) throw objError;

  const isPasswordEqual = await bcrypt.compare(password, userLogged.password);
  if (!isPasswordEqual) throw objError;

  const token = jwt.sign(
    { sub: userLogged.id_user, type: "logged" },
    JWT_SECRET,
    {
      algorithm: "HS256",
    }
  );

  res.status(201).json({ token });
};
