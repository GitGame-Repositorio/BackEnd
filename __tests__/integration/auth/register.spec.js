const { v4: uuid } = require("uuid");
const { id } = require("../config");
const { app } = require("../../../src/index");

const request = require("supertest");
const api = request(app);

const { PrismaClient } = require("@prisma/client");
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

const db = new PrismaClient();

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

const populateDB = async () => {
  db.chapter.create({
    data: { id, title: "Git Add", titleGroup: "Comandos iniciais" },
  });
};

const data = {
  id_chapter: id,
  id_user: id,
};

const verifyFields = (dataSend, dataResponse) => {
  Object.keys(dataSend).forEach((key) => {
    expect(dataResponse).toHaveProperty(key);
    expect(dataResponse[key]).toBe(dataSend);
  });
};

describe("Tests for router progress_chapter", () => {
  const router = "/progress_chapter";

  // beforeAll(async () => {
  //   const response = await api.post("/login", {
  //     email: ADMIN_EMAIL,
  //     password: ADMIN_PASSWORD,
  //   });

  //   expect(response.data).toHaveProperty("token");
  //   expect(response.status).toBe(201);

  //   const { token } = response.data;
  //   const string = `Bearer ${token}`;
  //   api.defaults.headers.common.Authorization = string;
  // });

  beforeAll(async () => {
    await populateDB();
  });

  describe("Tests for router POST", () => {
    it.only("Create a record successfully", async () => {
      const response = await request(app)
        .post(router)
        .auth(ADMIN_EMAIL, ADMIN_PASSWORD)
        .send(data)
        .expect(201)
        .expect("Content-Type", /json/);

      verifyFields(data, response.data);
    });

    it("Not create a record if exists in DB", async () => {});

    it("Not create a record if id_user not exists", async () => {});

    it("Not create a record if id_chapter not exists", async () => {});
  });

  describe("Tests for router GET all", () => {
    it("Get all records", async () => {
      const response = await api.get(router);
      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
    });

    it("Get all records whit id_user", async () => {
      const response = await api.get(`${router}?id_user=${id}`);
      expect(response.status).toBe(200);
      expect(response.data).toBeInstanceOf(Array);
    });
  });

  describe("Tests for routers using id", () => {
    beforeEach(async () => {
      await deleteData(router, id);
      await createData(router, { ...dataCreate, id });
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
});
