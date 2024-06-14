import { NextFunction, Request, Response } from "express";
import { db } from "../../db";
import { redis } from "../../redis";

export const getProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = req.userId;
  const data = await redis.get(`progress-${id}`);
  if (!data) return next();
  const response = JSON.parse(data);
  res.json(response);
};

enum StatusProgress {
  TO_DO = "TO_DO",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

const statusObj = {
  0: StatusProgress.TO_DO,
  100: StatusProgress.COMPLETED,
};

export const generateProgress = async (req: Request, res: Response) => {
  const id = req.userId;

  const allCapter = await db.capter.findMany({
    include: { capterProgress: { where: { id_user: id } }, level: true },
  });

  const allProgress = await db.user.findUnique({
    where: { id },
    include: {
      capterProgress: {
        include: {
          levelProgress: {
            include: {
              contentProgress: true,
              level: {
                include: {
                  orderLevel: true,
                },
              },
            },
          },
          user: true,
        },
        where: {
          id_user: id,
        },
      },
    },
  });

  const listCapterProgress = allProgress?.capterProgress || [];

  const allCapterRemap = listCapterProgress.map((capterProgress) => {
    const newLevelProgress = capterProgress.levelProgress
      .map((levelProgress) => {
        const contentProgress = levelProgress?.contentProgress || [];

        const valueCountContent = contentProgress.reduce(
          (acumulator, current) => {
            const valueActual = current.complete ? 1 : 0;
            return valueActual + acumulator;
          },
          0
        );

        const sizeContentLevel = levelProgress.level.orderLevel?.length;
        const percentLevel = ((valueCountContent * 100) / sizeContentLevel) | 0;

        const response = {
          percentLevel,
          ...levelProgress,
          status: statusObj[percentLevel] || StatusProgress.IN_PROGRESS,
        };
        return response;
      })
      .flat();

    const sumLevelPercent = newLevelProgress.reduce((acumulator, current) => {
      const percent = current.percentLevel;
      return percent + acumulator;
    }, 0);

    const capterFind = allCapter?.find(
      (capter) => capter.id === capterProgress.id_capter
    );

    const countCapter = capterFind?.level?.length;
    const percentCapter = Math.floor(sumLevelPercent / countCapter);

    return {
      percentCapter,
      capterProgress: {
        ...capterProgress,
        levelProgress: newLevelProgress,
        status: statusObj[percentCapter] || StatusProgress.IN_PROGRESS,
        user: undefined,
      },
    };
  });

  const sumPercent = allCapterRemap.reduce((acumulator, capterCurrent) => {
    const percent = capterCurrent?.percentCapter;
    return percent + acumulator;
  }, 0);

  const completeGamePercentage = Math.floor(sumPercent / allCapter.length) | 0;
  const response = { completeGamePercentage, allCapterRemap };

  const minutes = 5;
  const secondsInMinute = 60;

  await redis.set(`progress-${id}`, JSON.stringify(response), {
    EX: minutes * secondsInMinute,
  });

  res.status(201).json(response);
};
