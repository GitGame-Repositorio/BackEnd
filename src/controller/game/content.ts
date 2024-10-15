import { NextFunction, Request, Response } from "express";
import { Privilegies } from "@prisma/client";
import { db } from "../../database/postgres";
import { nextContentID } from "../../services/numbers";
import { mongo } from "../../database/mongo";
import { convertID } from "../../services/mongoCRUD";

export const handleAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const privilegies: Privilegies = req.privilegies;

  const objError = {
    status: 401,
    message: "Access denied. Protecting activity privacy.",
  };

  if (!privilegies.canManageContentGame) throw objError;
  next();
};

const include = { level: true };

const resObj = (obj: object) => {
  return { ...obj, resolution: undefined, _id: undefined };
};

export const create = async (req: Request, res: Response) => {
  const { id_level, title, numberOrder } = req.body;

  const number = numberOrder || (await nextContentID(id_level));
  const contentMongo = await mongo.content.insertOne(req.body);
  const id_content = contentMongo.insertedId.toString();

  const content = await db.content.create({
    data: { id_content, numberOrder: number, title, id_level },
    include,
  });

  res.status(201).json(resObj(content));
};

export const getAll = async (req: Request, res: Response) => {
  const listContent = await db.content.findMany({
    where: { ...req.body },
    include,
  });
  const response = await Promise.all(
    listContent.map(async (content) => {
      const contentMongo = await mongo.content.findOne({
        _id: convertID(content.id_content),
      });
      return resObj({ ...content, ...contentMongo });
    })
  );
  res.json(response);
};

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const content = await db.content.findUniqueOrThrow({
    where: { id },
    include,
  });

  const contentMongo = await mongo.content.findOne({
    _id: convertID(content.id_content),
  });

  const response = resObj({ ...contentMongo, ...content });
  res.json(response);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, numberOrder, ...rest } = req.body;

  const record = await db.content.findUniqueOrThrow({ where: { id } });
  await mongo.content.findOneAndUpdate(
    { _id: convertID(record.id_content) },
    { $set: rest }
  );

  const content = await db.content.update({
    data: { title, numberOrder },
    where: { id },
    include,
  });

  res.status(203).json(resObj(content));
};

export const destroy = async (req: Request, res: Response) => {
  const { id } = req.params;

  const record = await db.content.findUniqueOrThrow({ where: { id } });
  await mongo.exam.findOneAndDelete({
    _id: convertID(record.id_content),
  });

  const content = await db.content.delete({ where: { id } });
  res.status(204).json(content);
};
