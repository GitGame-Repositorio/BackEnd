import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";

import { db } from "../../../src/database/postgres";
import { expectAdminObj, expectUser, expectUserObj } from "./configTestsAuth";
import {
  mockRes,
  msgInvalidFormat,
  msgNotFound,
  msgUniqueConst,
  randomEmail,
  testUserIdInvalid,
  testUserIdNull,
} from "../config";

import {
  destroy,
  getById,
  update,
  updateImage,
} from "../../../src/controller/auth/user";

const createUser = async ({ email, password }) => {
  const passHash = await bcrypt.hash(password, 10);
  return await db.user.create({
    data: {
      userLogged: {
        create: { email, name: expectUser.name, password: passHash },
      },
    },
  });
};

describe("Tests for controller user", () => {
  let res, userId;
  const password = "secret";

  beforeAll(async () => {
    await db.user.deleteMany();
    const user = await createUser({ email: expectUser.email, password });
    userId = user.id;
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    res = mockRes();
  });

  describe.skip.each([
    { method: "get for id", callback: getById },
    { method: "update", callback: update },
    { method: "delete", callback: destroy },
  ])("Tests common in main functions", ({ method, callback }) => {
    it(`should throw an error when user ID is invalid when try ${method}`, async () => {
      testUserIdNull(callback);
    });

    it(`should throw an error when user ID not exists when try ${method}`, async () => {
      testUserIdInvalid(callback);
    });
  });

  describe("Tests for update image", () => {
    // Successfully updates user image when valid userId and file are provided
    it("should update user image when valid userId and file are provided", async () => {
      const req = {
        userId,
        file: { filename: "profile.jpg" },
      } as any as Request;

      await updateImage(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          picture: "/images/profile.jpg",
        })
      );
    });
  });

  describe("Tests for get user", () => {
    // Successfully retrieves user by ID and returns the correct response
    it("should return user data when user ID exists", async () => {
      const req = { userId } as Request;
      await getById(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining(expectUserObj)
      );
    });

    // Successfully retrieves admin user by ID and returns the correct response
    it("should return user admin data when user ID exists", async () => {
      const email = `${uuid()}@email.com`;
      const user = await createUser({ email, password });
      await db.admin.create({
        data: {
          id_userLogged: user.id,
          privilegies: { create: {} },
        },
      });

      const req = { userId: user.id } as Request;
      await getById(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          ...expectUserObj,
          admin: expect.objectContaining(expectAdminObj),
          type: "logged",
          email,
        })
      );
    });

    it("should return user data when user anonymous exists", async () => {
      const user = await db.user.create({ data: {} });

      const req = { userId: user.id } as Request;

      await getById(req, res);

      const obj = res.json.mock.calls[0][0];

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining(user));
      expect(obj.type).toBe("anonymous");
      expect(obj.admin).toBeNull;
    });
  });

  describe("Tests for update user", () => {
    beforeEach(async () => {
      await db.user.deleteMany();
      const user = await createUser({ email: expectUser.email, password });
      userId = user.id;
    });

    it("should return user data when name field is updated successfully", async () => {
      const objUpdate = { name: "Update Name" };
      const req = { userId, body: objUpdate } as Request;

      await update(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining(objUpdate));
    });

    it("should return user data when language field is updated successfully", async () => {
      const objUpdate = { language: "english" };
      const req = { userId, body: objUpdate } as Request;

      await update(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining(objUpdate));
    });

    it("should return user data when appearance field is updated successfully", async () => {
      const objUpdate = { appearance: "DARK" };
      const req = { userId, body: objUpdate } as Request;

      await update(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining(objUpdate));
    });

    it("should return user data when email field is updated successfully", async () => {
      const objUpdate = { email: randomEmail() };
      const req = { userId, body: objUpdate } as Request;

      await update(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining(objUpdate));
    });

    it("should throw an error when email field have is in use", async () => {
      const email = randomEmail();
      const user = await createUser({ email, password });

      const req = {
        userId: user.id,
        body: { email: expectUser.email },
      } as Request;

      await expect(update(req, res)).rejects.toThrow(msgUniqueConst("email"));
    });

    it("should throw an error when email field is invalid", async () => {
      const objUpdate = { email: `EMAIL_NOT_VALID` };
      const req = { userId, body: objUpdate } as Request;

      await expect(update(req, res)).rejects.toThrow(msgInvalidFormat("email"));
    });
  });

  describe("Tests for deleting user", () => {
    beforeEach(async () => {
      await db.user.deleteMany();
      const user = await createUser({ email: expectUser.email, password });
      userId = user.id;
    });

    it("should deleting user whit success whit user id exists", async () => {
      const req = { userId } as Request;
      await destroy(req, res);

      const user = await db.user.findUnique({ where: { id: userId } });
      expect(res.status).toHaveBeenCalledWith(204);
      expect(user).toBeNull;
    });

    it("should throw an error when to try deleting user has already been deleted", async () => {
      const req = { userId } as Request;

      await destroy(req, res);
      expect(res.status).toHaveBeenCalledWith(204);

      await expect(destroy(req, res)).rejects.toThrow(msgNotFound("User"));
    });
  });
});
