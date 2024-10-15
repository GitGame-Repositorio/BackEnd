import { db } from "../../../src/database/postgres";
import { generateNumber, nextContentID } from "../../../src/services/numbers";

describe("nextContentID", () => {
  const id_level = "027c2792-0573-4e5a-a9b5-a065b7987ce6";

  const createMock = (numberOrder: number) => {
    const obj: any = { _count: { orderLevel: numberOrder } };
    return jest.spyOn(db.level, "findUniqueOrThrow").mockResolvedValue(obj);
  };

  // returns 1 when no orders exist for given id_level
  it("should return 1 when no orders exist for given id_level", async () => {
    const spy = createMock(0);

    const result = await nextContentID(id_level);
    expect(result).toBe(1);

    spy.mockRestore();
  });

  // returns incremented order level when orders exist for given id_level
  it("should return incremented order level when orders exist for given id_level", async () => {
    const spy = createMock(2);

    const result = await nextContentID(id_level);
    expect(result).toBe(3);

    spy.mockRestore();
  });

  // correctly interacts with database to fetch count of orders
  it("should return count + 1 when orders exist for given id_level", async () => {
    const spy = createMock(3);

    const result = await nextContentID(id_level);
    expect(result).toBe(4);

    spy.mockRestore();
  });

  // throws an error when id_level is not in valid UUID string format
  it("should throw an error when id_level is not in valid UUID string format", async () => {
    const invalidIdLevel = "invalid_id_level";
    await expect(nextContentID(invalidIdLevel)).rejects.toThrow(
      new Error("No Level found")
    );
  });

  // correctly increments order level count by a large value
  it("should correctly increment order level count by a large value", async () => {
    const spy = createMock(999999);

    const result = await nextContentID(id_level);
    expect(result).toBe(1000000);

    spy.mockRestore();
  });
});

describe("generateNumber", () => {
  // returns a number less than 10^max
  it("should return a number less than 10^max when max is greater than 0", () => {
    const max = 3;
    const result = generateNumber(max);
    expect(result).toBeLessThan(10 ** max);
  });

  // generates a number within the expected range consistently
  it("should generate a number within the expected range consistently", () => {
    const max = 5;
    const result = generateNumber(max);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(10 ** max);
  });

  // handles max value of 0 correctly
  it("should return 0 when max is 0", () => {
    const max = 0;
    const result = generateNumber(max);
    expect(result).toBe(0);
  });

  // handles negative max values gracefully
  it("should return 0 when max is negative", () => {
    const max = -3;
    const result = generateNumber(max);
    expect(result).toBe(0);
  });
});
