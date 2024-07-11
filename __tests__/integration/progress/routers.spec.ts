const axios = require("axios");
const { v4: uuid } = require("uuid");
const routers = require("./routers.json");
const dotenv = require("dotenv");
dotenv.config();

const { PrismaClient } = require("@prisma/client");
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

const db = new PrismaClient();

const port = process.env.PORT || 3000;
const baseURL = `http://localhost:${port}/api/v1`;

const api = axios.create({ baseURL });

const generateEmail = () => {
  return `${uuid()}@gmail.com`;
};

const handleValues = (data, id, idPlayer) => {
  const list = Object.entries(data).map(([key, value]) => {
    if (value === "{{ID}}") return [key, id];
    else if (typeof value !== "string") return [key, value];
    const newValue = value.replace(/{{(.*?)}}/g, (match, content) => {
      return content
        .replace("ID_PLAYER", idPlayer)
        .replace("ID", id)
        .replace(/D/g, () => Math.floor(Math.random(0, 9) * 10));
    });
    return [key, newValue];
  });
  return Object.fromEntries(list);
};

const createData = async (table, data) => {
  try {
    await db[table].create({ data });
  } catch {
    console.log("OK");
  }
};

const deleteData = async (table, id) => {
  try {
    await db[table].delete({ where: { id } });
  } catch {
    console.log("OK");
  }
};

const populateData = async (routers, id, idPlayer) => {
  await routers.forEach(async (obj) => {
    const data = handleValues(obj.data, id, idPlayer);
    await createData(obj.router, data);
  });
};

const temp = [
  {
    router: "capter",
    data: { title: "Rustic Cotton Tuna" },
    update: { title: "Title update" },
  },
  {
    router: "level",
    data: {
      id_capter: "{{ID}}",
      title: "Rustic Rubber Gloves",
    },
    update: { title: "Title update" },
    dependencies: ["capter"],
  },
];

describe.each(routers)(
  "Tests for router: $router",
  ({ router, data, update, dependencies }) => {
    const idPlayer = uuid();
    const id = uuid();

    beforeAll(async () => {
      await db.user.create({
        data: {
          id: idPlayer,
          email: generateEmail(),
          password: "secret",
          Player: { create: {} },
        },
      });

      const admin = {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        second_password: ADMIN_PASSWORD,
      };

      const response = await api.post("/login", admin);
      expect(response.data).toHaveProperty("token");
      expect(response.status).toBe(201);

      const listRouters = temp
        .filter((obj) => dependencies?.includes(obj.router))
        .map((obj) => ({ ...obj, id }));

      await populateData(listRouters, id, idPlayer);

      const { token } = response.data;
      const string = `Bearer ${token}`;
      api.defaults.headers.common.Authorization = string;
    });

    const dataCreate = handleValues(data, id, idPlayer);

    it("Method get for list records", async () => {
      const response = await api.get(router);
      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
    });

    it("Create a record successfully", async () => {
      const response = await api.post(router, dataCreate);

      expect(response.status).toBe(201);
      expect(response.data).toBeInstanceOf(Object);

      Object.keys(data).forEach((key) => {
        expect(response.data).toHaveProperty(key);
        expect(response.data[key]).toBe(dataCreate[key]);
      });
    });

    describe("Tests for routers using id", () => {
      beforeEach(async () => {
        await deleteData(router, id);
        await createData(router, {...dataCreate, id});
      });

      it("Get one record successfully", async () => {
        const response = await api.get(`${router}/${id}`);

        expect(response.status).toBe(200);
        expect(response.data).toBeInstanceOf(Object);

        Object.keys(data).forEach((field) => {
          expect(response.data).toHaveProperty(field);
        });
      });

      it("Update some record properties with successfully", async () => {
        const dataUpdate = handleValues(update, id, idPlayer);
        const response = await api.patch(`${router}/${id}`, dataUpdate);

        expect(response.status).toBe(203);
        expect(response.data).toBeInstanceOf(Object);

        Object.keys(update).forEach((field) => {
          expect(response.data).toHaveProperty(field);
          expect(response.data[field]).toBe(update[field]);
        });
      });

      it("Update all record properties with successfully", async () => {
        const newData = handleValues({ ...data, ...update }, id, idPlayer);
        const response = await api.patch(`${router}/${id}`, newData);

        expect(response.status).toBe(203);
        expect(response.data).toBeInstanceOf(Object);

        Object.keys(newData).forEach((field) => {
          expect(response.data).toHaveProperty(field);
          expect(response.data[field]).toBe(newData[field]);
        });
      });

      it("Delete a record successfully", async () => {
        const response = await api.delete(`${router}/${id}`);
        expect(response.status).toBe(204);
        expect(response.data).toBe("");
      });

      it("Try update record not exists", async () => {
        const updateData = handleValues(update, id, idPlayer);
        const idRandom = uuid();
        try {
          await api.patch(`${router}/${idRandom}`, updateData);
          throw new Error("Error common");
        } catch (error) {
          expect(error).toBeInstanceOf(axios.AxiosError);
          expect(error.response.status).toBe(404);
        }
      });

      it("Try get record not exists", async () => {
        const idRandom = uuid();
        try {
          await api.get(`${router}/${idRandom}`);
          throw new Error("Error common");
        } catch (error) {
          expect(error).toBeInstanceOf(axios.AxiosError);
          expect(error.response.status).toBe(404);
        }
      });

      it("Try delete record after deleting", async () => {
        const response = await api.delete(`${router}/${id}`);
        expect(response.status).toBe(204);
        expect(response.data).toBe("");

        try {
          await api.delete(`${router}/${id}`);
          throw new Error("Error common");
        } catch (error) {
          expect(error).toBeInstanceOf(axios.AxiosError);
          expect(error.response.status).toBe(404);
        }
      });
    });
  }
);
