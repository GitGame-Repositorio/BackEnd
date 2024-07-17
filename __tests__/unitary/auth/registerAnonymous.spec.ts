import { registerAnonymous } from "../../../src/controller/auth/auth";
import { db } from "../../../src/db";
import { expectUser } from "./configTestsAuth";

describe("Tests for controller create user anonymous", () => {
  let req, res;

  beforeEach(async () => {
    await db.user.deleteMany();

    req = {} as Request;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    jest.clearAllMocks();
  });

  it("should create an anonymous user and return a token when the database operation is successful", async () => {
    await registerAnonymous(req, res);
    const obj = res.json.mock.calls[0][0];

    expect(res.status).toHaveBeenCalledWith(201);
    expect(obj.id).toMatch(
      /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/
    );
    expect(obj.picture).toBe(expectUser.picture);
    expect(obj.token).not.toBeNull;
  });
});
