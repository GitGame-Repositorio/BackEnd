import { db } from "../db";

export const nextOrderLevel = async (id_level: string) => {
  const levelObj = await db.level.findUniqueOrThrow({
    where: { id: id_level },
    select: {
      _count: true,
    },
  });
  const count = levelObj._count.orderLevel;
  return count + 1;
};

export const generateNumber = (max: number) => {
  return Math.floor(Math.random() * 10 ** max);
};
