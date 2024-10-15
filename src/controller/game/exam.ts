import { NextFunction, Request, Response } from "express";
import { Privilegies } from "@prisma/client";
import { db } from "../../database/postgres";
import { mongoDB, mongo } from "../../database/mongo";
import { Exam } from "../../@types/game";
import { ObjectId } from "mongodb";
import { convertID, findExam } from "../../services/mongoCRUD";

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
  const { id_chapter, ...rest } = req.body;

  await db.chapter.findUniqueOrThrow({ where: { id: id_chapter } });
  const obj = await mongo.exam.insertOne(rest);
  const id = obj.insertedId.toString();

  await db.chapter.update({
    data: { id_exam: id },
    where: { id: id_chapter },
  });

  const exam = await mongo.exam.findOne({
    _id: ObjectId.createFromHexString(id),
  });

  res.status(201).json(exam);
};

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const exam = (await findExam(id)) || {};
  res.json(exam);
};

export const getAll = async (req: Request, res: Response) => {
  const { description, ...rest } = req.query;
  const exam = await mongo.exam.find(rest).toArray();
  res.json(exam);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  await mongo.exam.findOneAndUpdate({ _id: convertID(id) }, { $set: req.body });
  const exam = await findExam(id);
  res.status(203).json(exam);
};

export const destroy = async (req: Request, res: Response) => {
  const { id } = req.params;
  const exam = await mongo.exam.findOneAndDelete({
    _id: convertID(id),
  });
  res.status(204).json(exam);
};
