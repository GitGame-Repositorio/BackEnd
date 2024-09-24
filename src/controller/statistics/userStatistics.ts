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

  const allChapter = await db.chapter.findMany({
    include: { chapterProgress: { where: { id_user: id } }, level: true },
  });

  const allProgress = await db.user.findUnique({
    where: { id },
    include: {
      chapterProgress: {
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

  const listChapterProgress = allProgress?.chapterProgress || [];

  const allChapterRemap = listChapterProgress.map((chapterProgress) => {
    const newLevelProgress = chapterProgress.levelProgress
      .map((levelProgress) => {
        const contentProgress = levelProgress?.contentProgress || [];

        const valueCountContent = contentProgress.reduce(
          (accumulator, current) => {
            const valueActual = current.complete ? 1 : 0;
            return valueActual + accumulator;
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

    const sumLevelPercent = newLevelProgress.reduce((accumulator, current) => {
      const percent = current.percentLevel;
      return percent + accumulator;
    }, 0);

    const chapterFind = allChapter?.find(
      (chapter) => chapter.id === chapterProgress.id_chapter
    );

    const countChapter = chapterFind?.level?.length;
    const percentChapter = Math.floor(sumLevelPercent / countChapter);

    return {
      percentChapter,
      chapterProgress: {
        ...chapterProgress,
        levelProgress: newLevelProgress,
        status: statusObj[percentChapter] || StatusProgress.IN_PROGRESS,
        user: undefined,
      },
    };
  });

  const sumPercent = allChapterRemap.reduce((accumulator, chapterCurrent) => {
    const percent = chapterCurrent?.percentChapter;
    return percent + accumulator;
  }, 0);

  const completeGamePercentage = Math.floor(sumPercent / allChapter.length) | 0;
  const response = { completeGamePercentage, allChapterRemap: allChapterRemap };

  const minutes = 5;
  const secondsInMinute = 60;

  await redis.set(`progress-${id}`, JSON.stringify(response), {
    EX: minutes * secondsInMinute,
  });

  res.status(201).json(response);
};
