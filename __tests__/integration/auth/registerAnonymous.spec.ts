import { v4 as uuid } from "uuid";
import { id } from "../config";
import request from "supertest";

import { app } from "../../../src/index";
const api = request(app);

describe("Tests for register of the user anonymous", () => {
  it("Create new user anonymous whit success", () => {
    const response = await request(app)
      .post("/register")
      .send(data)
      .expect(201)
      .expect("Content-Type", /json/);
  });
});
