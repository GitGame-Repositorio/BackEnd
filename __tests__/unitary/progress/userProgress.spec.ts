import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";

import { db } from "../../../src/db";

import { mockRes } from "../config";

import {
  getProgress,
  generateProgress,
} from "../../../src/controller/statistics/userStatistics";

describe("Tests for get progress user", () => {
  const userId = uuid();
  let res;

  beforeAll(async () => {
    await db.user.deleteMany();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    res = mockRes();
  });

  describe("Tests for get progress correctly", () => {
    it("should return data correctly if exists in redis", async () => {});

    it("should go to next middleware when not exists in redis", async () => {});
  });

  describe("Tests for generate progress correctly", () => {
    it("should return data correctly", async () => {});

    it("should return value correctly for percent complete chapter", async () => {});

    it("should return value correctly for percent complete level", async () => {});

    it("should return value correctly for time complete chapter", async () => {});

    it("should return value correctly for time complete level", async () => {});

    it("should return value correctly for status complete chapter", async () => {});

    it("should return value correctly for status complete level", async () => {});

    it("should register in cache correctly", async () => {});
  });
});
