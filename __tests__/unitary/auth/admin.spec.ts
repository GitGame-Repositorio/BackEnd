import { Privilegies } from "@prisma/client";
import bcrypt from "bcrypt";

import { db } from "../../../src/db";
import { expectUser, expectUserObj } from "./configTestsAuth";
import { mockRes, randomEmail, testIdInvalid, testIdNull } from "../config";

import {
  destroy,
  getById,
  update,
  getAll,
  create,
} from "../../../src/controller/auth/admin";
import { generateNumber } from "../../../src/services/numbers";
import { unauthorizedError } from "../../../src/services/objError";

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
const expectPrivilegies = Object.fromEntries(
  privilegiesKeys.map((key) => [key, expect.any(Boolean)])
);

const createAdmin = async ({ email, password, privilegies }: props) => {
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
              privilegies: { create: privilegies || {} },
            },
          },
        },
      },
    },
  });
};

const clearDB = async (userId) => {
  await db.user.deleteMany({ where: { NOT: { id: userId } } });
};

const permissionSorted = () => {
  const number = generateNumber(1);
  const listPermission = Object.keys(allPrivilegiesAdmin).filter(
    (_, index) => index < number
  );

  const listRemap = listPermission.map((permission) => [permission, true]);

  return Object.fromEntries(listRemap);
};

describe.skip.each([create, update, destroy, getById])(
  "Tests common in main functions",
  (callback) => {
    const req = { privilegies: allPrivilegiesAdmin };

    it("should throw an error when id for admin not exists", async () => {
      testIdNull(callback, req);
    });

    it("should throw an error when id for admin is null", async () => {
      testIdInvalid("admin", callback, req);
    });
  }
);

describe("Tests for controller admin", () => {
  let res, userId, secondAdmin;
  const password = "secret";

  beforeAll(async () => {
    await db.user.deleteMany();
    const user = await createAdmin({
      privilegies: allPrivilegiesAdmin,
      email: expectUser.email,
      password,
    });

    userId = user.id;

    secondAdmin = await createAdmin({
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
      await clearDB(userId);
      listAdmins = await Promise.all(
        privilegiesKeys.map(async (privilegie) => {
          return await createAdmin({
            password,
            email: randomEmail(),
            privilegies: {
              ...allPrivilegiesAdmin,
              ...Object.fromEntries([[privilegie], [true]]),
            },
          });
        })
      );
    });

    const getAllSuccess = async (req: any, length: any) => {
      await getAll(req, res);

      const object = res.json.mock.calls[0][0];
      const results = Object.values(object);

      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThanOrEqual(length);

      return results;
    };

    it("should return list of the user when admin have permission", async () => {
      const req = {
        privilegies: allPrivilegiesAdmin,
        query: {},
      } as any;

      await getAllSuccess(req, listAdmins.length);
    });

    it("should return object user in list correctly", async () => {
      const req = {
        privilegies: allPrivilegiesAdmin,
        query: {},
      } as any;

      const results = await getAllSuccess(req, listAdmins.length);

      results.forEach((admin: any) => {
        const expectObj = Object.create({
          ...expectUser,
          name: expect.any(String) || undefined,
          email: expect.stringMatching(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
        });
        expect(admin).toMatchObject({
          ...expectObj,
          privilegies: expect.objectContaining(expectPrivilegies),
        });
      });
    });

    it("should return list when filter 1 permission", async () => {
      const objExpect = {
        privilegies: { canCreateAdmin: true },
      };

      const req = {
        privilegies: allPrivilegiesAdmin,
        body: objExpect.privilegies,
        query: {},
      } as any;

      const results = await getAllSuccess(req, 1);

      results.forEach((admin: any) => {
        expect(admin).toMatchObject(objExpect);
      });
    });

    it("should return list when filter 2 permission", async () => {
      const objExpect = {
        privilegies: { canCreateAdmin: true, canDeleteAdmin: true },
      };

      const req = {
        privilegies: allPrivilegiesAdmin,
        body: objExpect.privilegies,
        query: {},
      } as any;

      const results = await getAllSuccess(req, 2);

      results.forEach((admin: any) => {
        expect(admin).toMatchObject(objExpect);
      });
    });

    it("should return list when filter multiples permission", async () => {
      const objExpect = permissionSorted();

      const req = {
        privilegies: allPrivilegiesAdmin,
        body: objExpect,
        query: {},
      } as any;

      const results = await getAllSuccess(req, 2);

      results.forEach((admin: any) => {
        expect(admin).toMatchObject({ privilegies: objExpect });
      });
    });

    it("should return list when filter using AND", async () => {
      const objExpect = {
        privilegies: { canCreateAdmin: true, canDeleteAdmin: true },
      };

      const req = {
        privilegies: allPrivilegiesAdmin,
        body: { AND: objExpect.privilegies },
        query: {},
      } as any;

      const results = await getAllSuccess(req, 2);

      results.forEach((admin: any) => {
        expect(admin).toMatchObject(objExpect);
      });
    });

    it("should return list when filter using NOT", async () => {
      const objExpect = {
        privilegies: { canCreateAdmin: true },
      };

      const req = {
        privilegies: allPrivilegiesAdmin,
        body: { NOT: objExpect.privilegies },
        query: {},
      } as any;

      const results = await getAllSuccess(req, 1);

      results.forEach((admin: any) => {
        expect(admin).not.toMatchObject(objExpect);
      });
    });

    it("should return list when filter using OR", async () => {
      const objExpect = {
        privilegies: [{ canCreateAdmin: true }, { canDeleteAdmin: true }],
      };

      const req = {
        privilegies: allPrivilegiesAdmin,
        body: { OR: objExpect.privilegies },
        query: {},
      } as any;

      const results = await getAllSuccess(req, 2);

      const listFilter = objExpect.privilegies;

      results.forEach((admin: any) => {
        const { canCreateAdmin, canDeleteAdmin } = admin.privilegies;
        expect(
          canCreateAdmin == listFilter[0].canCreateAdmin ||
            canDeleteAdmin == listFilter[1].canDeleteAdmin
        ).toBeTruthy();
      });
    });

    it("should throw an error when user admin not have permission", async () => {
      const req = {
        privilegies: { canViewAllAdmin: false },
        query: {},
      } as any;

      await expect(getAll(req, res)).rejects.toMatchObject(unauthorizedError);
    });

    it("should throw an error when send empty privilegies (user common access)", async () => {
      const req = {
        privilegies: {},
        query: {},
      } as any;

      await expect(getAll(req, res)).rejects.toMatchObject(unauthorizedError);
    });
  });

  describe("Tests for create admin", () => {
    let userCommon;
    beforeEach(async () => {
      const newUser = await db.userLogged.create({
        data: {
          password,
          email: randomEmail(),
          user: { create: {} },
        },
      });
      userCommon = {
        id_user: newUser.id_user,
      };
    });

    it("should create and return data admin correctly when admin contain permission", async () => {
      const req = {
        privilegies: allPrivilegiesAdmin,
        body: userCommon,
      } as any;
      await create(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          ...expectUserObj,
          name: null,
          privilegies: expect.objectContaining(expectPrivilegies),
        })
      );
    });

    it("should throw an error user admin without permission try create data", async () => {
      const req = {
        privilegies: { canCreateAdmin: false },
        body: userCommon,
      } as any;
      await expect(create(req, res)).rejects.toMatchObject(unauthorizedError);
    });

    it("should throw an error when user common try create admin", async () => {
      const req = {
        privilegies: {},
        body: userCommon,
      } as any;
      await expect(create(req, res)).rejects.toMatchObject(unauthorizedError);
    });
  });

  describe("Tests for get admin", () => {
    let admin;
    beforeAll(async () => {
      admin = await createAdmin({
        privilegies: allPrivilegiesAdmin,
        email: expectUser.email,
        password,
      });
    });

    const expectAdmin = expect.objectContaining({
      ...expectUserObj,
      name: null,
      privilegies: expect.objectContaining(expectPrivilegies),
    });

    it("should return data admin correctly when admin contain permission", async () => {
      const req = {
        params: { id_user: admin.id },
        privilegies: allPrivilegiesAdmin,
        userId,
      } as any;
      await getById(req, res);
      expect(res.json).toHaveBeenCalledWith(expectAdmin);
    });

    it("should return data admin correctly when user request", async () => {
      const id = admin.id;
      const req = {
        params: { id_user: id },
        privilegies: {},
        userId: id,
      } as any;
      await getById(req, res);
      expect(res.json).toHaveBeenCalledWith(expectAdmin);
    });

    it("should throw an error when user common try access data", async () => {
      const userCommon = await db.userLogged.create({
        data: {
          password,
          email: randomEmail(),
          user: { create: {} },
        },
      });
      const req = {
        params: { id_user: secondAdmin.id },
        privilegies: {},
        body: userCommon,
      } as any;
      await expect(create(req, res)).rejects.toMatchObject(unauthorizedError);
    });

    it("should throw an error when user admin without permission try access data", async () => {
      const req = {
        params: { id_user: secondAdmin.id },
        privilegies: { canViewAllAdmin: false },
      } as any;
      await expect(create(req, res)).rejects.toMatchObject(unauthorizedError);
    });
  });

  describe("Tests for update admin", () => {
    const updateObj = { canCreateAdmin: true };
    const expectCommonAdmin = expect.objectContaining({
      ...expectUserObj,
      privilegies: expect.objectContaining(expectPrivilegies),
    });

    it("should update and return data admin correctly when admin contain permission", async () => {
      const req = {
        params: { id_user: secondAdmin.id },
        privilegies: allPrivilegiesAdmin,
        body: updateObj,
        userId,
      } as any;
      await update(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ privilegies: expectPrivilegies })
      );
    });

    it("should update and return data admin correctly when user request", async () => {
      const req = {
        params: { id_user: userId },
        privilegies: allPrivilegiesAdmin,
        body: updateObj,
        userId,
      } as any;
      await update(req, res);
      expect(res.json).toHaveBeenCalledWith(expectCommonAdmin);
    });

    it("should throw an error when user admin without permission try update data", async () => {
      const req = {
        params: { id_user: secondAdmin.id },
        privilegies: { canEditPrivilegiesAdmin: false },
        body: updateObj,
        userId,
      } as any;
      await expect(update(req, res)).rejects.toMatchObject(unauthorizedError);
    });

    it("should throw an error when user admin try update data whit type data wrong", async () => {
      const req = {
        params: { id_user: secondAdmin.id },
        privilegies: { canEditPrivilegiesAdmin: false },
        body: { canCreateAdmin: "string" },
        userId,
      } as any;
      await expect(update(req, res)).rejects.toThrow("Data wrong");
    });

    it("should throw an error when user common try update admin", async () => {
      const req = {
        params: { id_user: secondAdmin.id },
        privilegies: {},
        body: updateObj,
        userId,
      } as any;
      await expect(update(req, res)).rejects.toMatchObject(unauthorizedError);
    });
  });

  describe("Tests for delete admin", () => {
    let admin;
    beforeEach(async () => {
      admin = await createAdmin({
        email: randomEmail(),
        privilegies: {},
        password,
      });
    });

    it("should delete and return data admin correctly when admin contain permission", async () => {
      const req = {
        params: { id_user: admin.id },
        privilegies: allPrivilegiesAdmin,
        userId,
      } as any;
      await destroy(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });

    it("should delete and return data admin correctly when user request", async () => {
      const req = {
        params: { id_user: admin.id },
        userId: admin.id,
        privilegies: {},
      } as any;
      await destroy(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.any(Object));
    });

    it("should throw an error user admin without permission try delete data", async () => {
      const req = {
        params: { id_user: admin.id },
        privilegies: { canDeleteAdmin: false },
        userId: secondAdmin.id,
      } as any;
      await expect(destroy(req, res)).rejects.toMatchObject(unauthorizedError);
    });

    it("should throw an error when user common try delete admin", async () => {
      const req = {
        params: { id_user: admin.id },
        privilegies: { canDeleteAdmin: false },
        userId: secondAdmin.id,
      } as any;
      await expect(destroy(req, res)).rejects.toMatchObject(unauthorizedError);
    });
  });
});
