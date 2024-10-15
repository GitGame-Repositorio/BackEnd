import { Request, Response } from "express";
import { db } from "../../../src/database/postgres";
import { register } from "../../../src/controller/auth/auth";
import { mockRes, msgInvalidFormat, msgUniqueConst } from "../config";
import { expectUser } from "./configTestsAuth";
import { msgIsMissing } from "../../../src/services/objError";

describe("Tests for controller create user logged", () => {
  let req, res;
  const password = "N%EF$reWre2";

  beforeEach(async () => {
    await db.user.deleteMany();

    req = {
      body: {
        email: expectUser.email,
        name: expectUser.name,
        password,
      },
    } as Request;

    res = mockRes();
    jest.clearAllMocks();
  });

  // successfully creates a new user with valid data
  it("should create a new user when valid data is provided", async () => {
    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining(Object.create({ ...expectUser, name: null }))
    );
  });

  // not create user already exists
  it("not create a new user when user already exists", async () => {
    await db.user.create({
      data: {
        userLogged: {
          create: req.body,
        },
      },
    });
    await expect(register(req, res)).rejects.toThrow(msgUniqueConst("email"));
  });

  // handles missing password in the request body
  it("should throw error when password is missing", async () => {
    const newReq = {
      body: {
        email: "test@example.com",
        name: "Test User",
      },
    } as Request;

    await expect(register(newReq, res)).rejects.toThrow(
      msgIsMissing("password")
    );
  });

  // handles missing email in the request body
  it("should return 400 error when email is missing", async () => {
    const newReq = {
      body: {
        name: "Test User",
        password: "secret",
      },
    } as Request;

    await expect(register(newReq, res)).rejects.toThrow(msgIsMissing("email"));
  });

  //   // handles invalid email format in the request body
  it("should return 400 error when an invalid email format is provided", async () => {
    const newReq = {
      body: {
        email: "invalid_email_format",
        name: "Test User",
        password: "secret",
      },
    } as Request;

    await expect(register(newReq, res)).rejects.toThrow(
      msgInvalidFormat("email")
    );
  });
});
