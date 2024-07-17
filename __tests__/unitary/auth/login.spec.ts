import { Request, Response } from "express";
import bcrypt from "bcrypt";

import { db } from "../../../src/db";
import { expectUser } from "./configTestsAuth";
import { login } from "../../../src/controller/auth/auth";
import { msgIsMissing } from "../config";

describe("Tests for controller login", () => {
  let res;
  const password = "secret";

  const objError = { status: 401, message: "email or password incorrect" };

  beforeAll(async () => {
    await db.user.deleteMany();

    const passHash = await bcrypt.hash(password, 10);
    await db.user.create({
      data: {
        userLogged: { create: { email: expectUser.email, password: passHash } },
      },
    });
  });

  beforeEach(async () => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    jest.clearAllMocks();
  });

  // Should realized login whit correct email and password
  it("Successful login with correct email and password", async () => {
    const req = {
      body: {
        email: expectUser.email,
        password,
      },
    } as Request;

    await login(req, res);
    const obj = res.json.mock.calls[0][0];

    expect(res.status).toHaveBeenCalledWith(201);
    expect(obj.token).not.toBeNull;
  });

  // Incorrect password leading to 401 error
  it("Login fail whit incorrect password", async () => {
    const req = {
      body: {
        email: expectUser.email,
        password: "incorrect_password",
      },
    } as Request;

    await expect(login(req, res)).rejects.toMatchObject(objError);
  });

  // Incorrect email leading to 401 error
  it("Login fail whit incorrect email", async () => {
    const req = {
      body: {
        email: "incorrect@email.com",
        password,
      },
    } as Request;

    await expect(login(req, res)).rejects.toMatchObject(objError);
  });

  // Missing email leading to 401 error
  it("Login fails with missing email", async () => {
    const req = {
      body: { password },
    } as Request;

    await expect(login(req, res)).rejects.toThrow(
      new Error(msgIsMissing("email"))
    );
  });

  it("Login fails with missing password", async () => {
    const req = {
      body: {
        email: expectUser.email,
      },
    } as Request;

    await expect(login(req, res)).rejects.toThrow(
      new Error(msgIsMissing("password"))
    );
  });
});
