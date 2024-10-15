import { ObjectId } from "mongodb";
import { mongo } from "../database/mongo";

export const convertID = (id: string) => {
  return ObjectId.createFromHexString(id);
};

export const findExam = async (id: string) => {
  if (!id) return undefined;
  return await mongo.exam.findOne({ _id: convertID(id) });
};
