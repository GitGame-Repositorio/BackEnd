import { db } from "../db";

const truncNum = (num, limit = 2) => parseFloat(num.toFixed(limit));

export const playerStatistics = async () => {
  const countUser = await db.user.count();
  const countPlayer = await db.userLogged.count();
  const percentPlayerLogged = truncNum((countPlayer * 100) / countUser);

  const listChapters = await db.chapter.findMany();
  const listIdChapters = listChapters.map(({ id }) => id);

  const queryUserFinishingGame = await db.chapterProgress.findMany({
    distinct: "id_user",
    where: {
      id_chapter: { in: listIdChapters },
      exam_complete: true,
    },
  });

  const countUserFinishingGame = queryUserFinishingGame.length;
  const percentUserFinishingGame = truncNum(
    (countUserFinishingGame * 100) / countUser
  );

  return {
    countUser,
    countPlayer,
    percentPlayerLogged,
    countUserFinishingGame,
    percentUserFinishingGame,
  };
};

export const chapterStatistics = async () => {
  const countUser = (await db.userLogged.count()) || 0;
  const allChapters = await db.chapter.findMany();
  const allChProgCompleat = await db.chapterProgress.findMany({
    include: { _count: true },
    distinct: "id_chapter",
  });
  return allChapters.map((obj) => {
    const objChProgress = allChProgCompleat.find(
      (progress) => progress.id_chapter === obj.id
    );
    const countUserCompleat: number = Number(objChProgress?._count) || 0;
    const countUserNotCompleat = countUser - countUserCompleat;
    const percentUserCompleat = truncNum(
      (countUserCompleat * 100) / countUserNotCompleat
    );
    return {
      ...obj,
      timeForCompleat: "1h32min",
      countUserNotCompleat,
      percentUserCompleat,
      countUserCompleat,
    };
  });
};

export const levelStatistics = async ({ id_chapter }) => {
  const countUser = (await db.userLogged.count()) || 0;
  const allLevels = await db.level.findMany({ where: { id_chapter } });
  const allLvProgCompleat = await db.levelProgress.findMany({
    include: { _count: true },
    distinct: "id_level",
  });
  return allLevels.map((obj) => {
    const objChProgress = allLvProgCompleat.find(
      (progress) => progress.id_level === obj.id
    );
    const countUserCompleat: number = Number(objChProgress?._count) || 0;
    const countUserNotCompleat = countUser - countUserCompleat;
    const percentUserCompleat = truncNum(
      (countUserCompleat * 100) / countUserNotCompleat
    );
    return {
      ...obj,
      timeForCompleat: "1h32min",
      countUserNotCompleat,
      percentUserCompleat,
      countUserCompleat,
    };
  });
};

export const contentStatistics = async ({ id_level }) => {
  const countUser = (await db.userLogged.count()) || 0;
  const allRecords = await db.orderLevel.findMany({
    where: { id_level },
    include: { activity: { include: { assessment: true } }, subject: true },
  });
  const allObjProgCompleat = await db.contentProgress.findMany({
    include: {
      levelProgress: {
        include: {
          _count: true,
        },
      },
    },
    where: { complete: true },
    distinct: "id_order_level",
  });
  return allRecords.map((obj) => {
    const objChProgress = allObjProgCompleat.find(
      (progress) => progress.id_order_level === obj.id
    );
    const countUserCompleat: number =
      Number(objChProgress?.levelProgress._count) || 0;
    const countUserNotCompleat = countUser - countUserCompleat;
    const percentUserCompleat = truncNum(
      (countUserCompleat * 100) / countUserNotCompleat
    );
    const content = obj.subject[0] || obj.activity[0].assessment;
    return {
      ...obj,
      ...content,
      timeForCompleat: "1h32min",
      countUserNotCompleat,
      percentUserCompleat,
      countUserCompleat,
    };
  });
};
