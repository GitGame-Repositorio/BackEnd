import { Request, Response } from "express";
import { v4 as uuid } from "uuid";

export const msgUniqueConst = (value) =>
  "Unique constraint failed on the fields: (`" + value + "`)";

export const msgInvalidFormat = (value) => "Invalid " + value + " format";

export const msgNotFound = (value) => `No ${value} found`;

export const regexUUID =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

export const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const randomEmail = () => `${uuid()}@test.com`;

export const mockRes = () => {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as unknown as Response;
};

export const testUserIdNull = async (callback) => {
  const req = { userId: null, body: {} } as Request;
  const res = mockRes();

  await expect(callback(req, res)).rejects.toThrow(
    "Argument `id` must not be null."
  );
};

export const testUserIdInvalid = async (callback) => {
  const req = { userId: uuid(), body: {} } as Request;
  const res = mockRes();

  await expect(callback(req, res)).rejects.toThrow(
    "An operation failed because it depends on one or more records that were required but not found."
  );
};

export const testIdNull = async (callback, reqCustom = {}) => {
  const req = { params: { id: null }, body: {}, ...reqCustom } as any;
  const res = mockRes();

  await expect(callback(req, res)).rejects.toThrow(
    "Argument `id` must not be null."
  );
};

export const testIdInvalid = async (name, callback, reqCustom = {}) => {
  const req = { params: { id: uuid() }, body: {}, ...reqCustom } as any;
  const res = mockRes();
  await expect(callback(req, res)).rejects.toThrow(msgInvalidFormat(name));
};
