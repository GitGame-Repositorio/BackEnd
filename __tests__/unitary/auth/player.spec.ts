import { destroy, getById, update } from "../../../src/controller/auth/player";
import { testUserIdInvalid, testUserIdNull } from "../config";

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