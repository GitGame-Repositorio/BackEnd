import { UserLogged } from "@prisma/client";
import { sendValidateUser } from "../../services/email";
import bcrypt from "bcrypt";

import { db } from "../../db";
import { Request, Response } from "express";

export const changeAccountType = async (req: Request, res: Response) => {
  const { email, urlBase } = req.body;
  const { userId } = req;
  // const { id_user } = await db.userLogged.findUnique({ where: { email } });
  const link = await bcrypt.hash(id_user, 10);

  await sendValidateUser(email, code);

  await redis.set(
    `${redisKeyCode}-${hash}`,
    JSON.stringify({ key: hash, code, email }),
    {
      EX: 3600,
    }
  );
};
