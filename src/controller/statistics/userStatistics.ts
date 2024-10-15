import { NextFunction, Request, Response } from "express";
import { db } from "../../database/postgres";
import { redis } from "../../database/redis";

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

const sumPercentInList = ({
  propName,
  list,
}: {
  list: object[];
  propName: string;
}) => {
  return list.reduce((accumulator, current) => {
    const percent = current[propName];
    return percent + accumulator;
  }, 0);
};

const storeRedis = async ({ key, obj }: { key: string; obj: object }) => {
  const minutes = 5;
  const secondsInMinute = 60;

  await redis.set(key, JSON.stringify(obj), {
    EX: minutes * secondsInMinute,
  });
};

const objStatusProgress = {
  0: "TO_DO",
  100: "COMPLETED",
};

const getStatus = (percent: number) =>
  objStatusProgress[percent] || "IN_PROGRESS";

const calculatePercent = ({ count, size }: { count: number; size: number }) =>
  Math.floor((count * 100) / size) | 0;

export const generateProgress = async (req: Request, res: Response) => {
  const id = req.userId;

  const allChapter = await db.chapter.findMany({
    include: {
      chapterProgress: { where: { id_user: id } },
      level: { include: { content: true } },
    },
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
                  content: true,
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

  const allChapterRemap = allChapter.map((chapter) => {
    const chProgress = allProgress?.chapterProgress.find(
      (progress) => progress.id_chapter === chapter.id
    );

    const listLevel = chapter.level.map((level) => {
      const lvProgress = chProgress?.levelProgress?.find(
        (progress) => progress.id_level === level.id
      );

      const listContent = level.content.map((content) => {
        const ctProgress = lvProgress?.contentProgress?.find(
          (progress) => progress.id_content === content.id
        );

        return {
          ...ctProgress,
          ...content,
        };
      });

      const countContentComplete = listContent.filter(
        (obj) => obj.complete
      ).length;

      const percentLevel = calculatePercent({
        count: countContentComplete,
        size: listContent.length,
      });

      return {
        ...level,
        content: listContent,
        percentLevel,
        status: getStatus(percentLevel),
      };
    });

    const sumPercent = sumPercentInList({
      propName: "percentLevel",
      list: listLevel,
    });

    const percentChapter = calculatePercent({
      count: sumPercent,
      size: listLevel.length * 100,
    });
    return {
      ...chapter,
      level: listLevel,
      percentChapter,
      status: getStatus(percentChapter),
    };
  });

  const sumPercent = sumPercentInList({
    list: allChapterRemap,
    propName: "percentChapter",
  });

  const completeGamePercentage = calculatePercent({
    count: sumPercent,
    size: allChapterRemap.length * 100,
  });

  const response = { completeGamePercentage, allChapterRemap: allChapterRemap };

  await storeRedis({ key: `progress-${id}`, obj: response });

  res.status(201).json(response);
};
