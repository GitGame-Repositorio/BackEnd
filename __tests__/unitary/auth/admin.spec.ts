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
          admin: {
            create: {
              second_password: password,
              privilegies: { create: privilegies || {} },
            },
          },
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

    it("should return list of the user when admin have permission", async () => {
      const req = {
        params: { id_user: secondAdmin.id },
        privilegies: allPrivilegiesAdmin,
        userId,
      } as any;

      await getAll(req, res);

      const object = res.json.mock.calls[0][0];
      const results = Object.values(object);
      console.log(results);

      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThanOrEqual(listAdmins.length);

      // results.forEach((obj: any) => {
      //   const admin = listAdmins.find(
      //     (admin) => admin.id === obj.id_userLogged
      //   );
      //   expect(obj).toMatchObject(admin);
      // });
    });

    it("should return list when filter 1 permission", () => {});

    it("should return list when filter 2 permission", () => {});

    it("should return list when filter multiples permission", () => {});

    it("should throw an error when user admin not have permission", () => {});

    it("should return list of the user correctly", () => {});

    it("should return object user in list correctly", () => {});
  });

  describe("Tests for create admin", () => {
    it("should create and return data admin correctly when admin contain permission", () => {});

    it("should throw an error user admin without permission try create data", () => {});

    it("should throw an error when user common try create admin", () => {});

    it("should throw an error when id for admin not exists", () => {});

    it("should throw an error when id for admin is null", () => {});
  });

  describe("Tests for get admin", () => {
    it("should return data admin correctly when admin contain permission", () => {});

    it("should return data admin correctly when user request", () => {});

    it("should throw an error when id for admin is null", () => {});

    it("should throw an error when id for admin not exists", () => {});

    it("should throw an error when user common try access data", () => {});

    it("should throw an error when user admin without permission try access data", () => {});
  });

  describe("Tests for update admin", () => {
    it("should update and return data admin correctly when admin contain permission", () => {});

    it("should update and return data admin correctly when user request", () => {});

    it("should throw an error user admin without permission try update data", () => {});

    it("should throw an error when user common try update admin", () => {});

    it("should throw an error when id for admin not exists", () => {});

    it("should throw an error when id for admin is null", () => {});
  });

  describe("Tests for delete admin", () => {
    it("should delete and return data admin correctly when admin contain permission", () => {});

    it("should delete and return data admin correctly when user request", () => {});

    it("should throw an error user admin without permission try delete data", () => {});

    it("should throw an error when user common try delete admin", () => {});

    it("should throw an error when id for admin not exists", () => {});

    it("should throw an error when id for admin is null", () => {});
  });
});
