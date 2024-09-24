import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";

import { db } from "../../../src/db";
import { expectAdminObj, expectUser } from "./configTestsAuth";
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
  getAll,
} from "../../../src/controller/auth/admin";
import { Privilegies, UserLogged } from "@prisma/client";

type props = {
  email: string;
  password: string;
  privilegies?: Partial<Privilegies>;
};

const allPrivilegiesAdmin: Partial<Privilegies> = {
  canCreateAdmin: true,
  canDeleteAdmin: true,
  canViewAllAdmin: true,
  canEditPrivilegiesAdmin: true,
  canManageCRUDPlayer: true,
  canManageCRUDReports: true,
  canManageContentGame: true,
  canReorderContentGame: true,
};

const privilegiesKeys = Object.keys(allPrivilegiesAdmin);

const createUser = async ({ email, password, privilegies }: props) => {
  const passHash = await bcrypt.hash(password, 10);
  return await db.user.create({
    data: {
      userLogged: {
        create: {
          email,
          name: expectUser.name,
          password: passHash,
        },
      },
    },
  });
};

describe("Tests for controller admin", () => {
  let res, userId, secondAdmin;
  const password = "secret";

  beforeAll(async () => {
    await db.user.deleteMany();
    const user = await createUser({
      privilegies: allPrivilegiesAdmin,
      email: expectUser.email,
      password,
    });

    userId = user.id;

    secondAdmin = await createUser({
      privilegies: allPrivilegiesAdmin,
      email: randomEmail(),
      password,
    });
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    res = mockRes();
  });

  describe("Tests for get all", () => {
    let listAdmins;

    beforeAll(async () => {
      await db.user.deleteMany();
      listAdmins = await Promise.all(
        privilegiesKeys.map(async (privilegie) => {
          return await createUser({
            password,
            email: randomEmail(),
            privilegies: Object.fromEntries([[privilegie], [true]]),
          });
        })
      );
    });
  });
});
