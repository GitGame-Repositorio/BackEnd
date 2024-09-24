import { msgIsMissing } from "../../../src/services/objError";

describe("msgIsMissing", () => {
  it("should return string correctly when pass string 'email'", () => {
    const value = "email";
    const res = msgIsMissing(value);
    expect(res).toBe("Argument `" + value + "` is missing");
  });

  it("should return string correctly when pass string 'password'", () => {
    const value = "password";
    const res = msgIsMissing(value);
    expect(res).toBe("Argument `" + value + "` is missing");
  });
});
