import { NextFunction, Request, Response } from "express";
import { LevelProgress, Privilegies } from "@prisma/client";
import { db } from "../../db";
import { unauthorizedError } from "../../services/objError";

const include = { orderLevel: true, levelProgress: true };

export const handleAccessUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { userId, method } = req;

  if (req.adminAccess) return next();

  const progress = await db.contentProgress.findFirst({
    where: { id },
    include: {
      ...include,
      levelProgress: { include: { chapterProgress: true } },
    },
  });

  const idUserChapter = progress?.levelProgress?.chapterProgress?.id_user;

  if (userId === idUserChapter) return next();
  if (method === "POST") {
    const { id_level_progress } = req.body;
    if (!id_level_progress) return next();

    const levelProgress = await db.levelProgress.findUnique({
      where: { id: id_level_progress },
      include: { chapterProgress: true },
    });

    const idUserLevel = levelProgress?.chapterProgress?.id_user;
    if (idUserLevel === userId) return next();
  }

  throw unauthorizedError;
};

export const handleAccessAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;

  const admin = await db.admin.findUnique({
    where: { id_userLogged: userId },
    select: { id_userLogged: true, privilegies: true },
  });

  if (!admin) {
    return next();
  }
  const privilegies: Privilegies = admin.privilegies;

  if (!privilegies.canManageCRUDPlayer) throw unauthorizedError;

  req.adminAccess = true;
  next();
};

export const create = async (req: Request, res: Response) => {
  const { id, id_order_level, id_level_progress, complete } = req.body;
  const id_user = req.userId;

  const orderLevel = await db.orderLevel.findUnique({
    where: { id: id_order_level },
    include: { level: { include: { chapter: true } } },
  });

  const { id_chapter } = orderLevel.level;

  const chProgress = await db.chapterProgress.findFirst({
    where: { id_chapter, id_user },
  });

  const lvProgress = await db.levelProgress.findFirst({
    where: {
      id_chapter_progress: chProgress?.id || "",
      id_level: orderLevel.id_level,
    },
  });

  const contentProgress = await db.contentProgress.create({
    data: {
      id,
      complete,
      orderLevel: {
        connect: { id: id_order_level },
      },
      levelProgress: {
        connectOrCreate: {
          create: {
            level: {
              connect: {
                id: orderLevel.id_level,
              },
            },
            chapterProgress: {
              connectOrCreate: {
                create: { id_chapter, id_user },
                where: {
                  id: chProgress?.id || "",
                },
              },
            },
          },
          where: {
            id: id_level_progress || lvProgress?.id || "",
          },
        },
      },
    },
  });

  res.status(201).json(contentProgress);
};

// export const create = async (req: Request, res: Response) => {
//   const { id, id_order_level, id_level_progress, complete } = req.body;
//   const id_user = req.userId;

//   const orderLevel = await db.orderLevel.findUniqueOrThrow({
//     where: { id: id_order_level },
//     include: { level: true },
//   });

//   const chapterProgress =
//     id_level_progress &&
//     (await db.chapterProgress.findFirst({
//       where: {
//         id_user,
//         levelProgress: {
//           some: { contentProgress: { some: { id_order_level } } },
//         },
//       },
//       include: { levelProgress: { include: { contentProgress: true } } },
//     }));

//     console.log(chapterProgress)

//   const chProgress =
//     !chapterProgress &&
//     (await db.chapterProgress.create({
//       data: { id_chapter: orderLevel.level.id_chapter, id_user },
//     }));

//   console.log(chProgress)

//   // const lvProgress =
//   //   !levelProgress &&
//   //   (await db.levelProgress.create({
//   //     data: {
//   //       id_level: orderLevel.id_level,
//   //       id_chapter_progress:
//   //         levelProgress?.id_chapter_progress || chProgress?.id,
//   //     },
//   //   }));

//   // console.log(id_level_progress);
//   // console.log(levelProgress);
//   // console.log(lvProgress);

//   // const contentProgress = await db.contentProgress.create({
//   //   data: {
//   //     id,
//   //     complete,
//   //     id_order_level,
//   //     id_level_progress:
//   //       id_level_progress || levelProgress?.id || lvProgress?.id,
//   //   },
//   // });

//   // res.status(201).json(contentProgress);
//   res.status(201).json(chProgress);
// };

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const contentProgress = await db.contentProgress.findUniqueOrThrow({
    where: { id },
  });
  res.json(contentProgress);
};

export const getAll = async (req: Request, res: Response) => {
  const { id_user, ...query } = req.query;

  // const objFilterUser = id_user
  //   ? { levelProgress: { chapterProgress: { id_user } } }
  //   : {};

  // const filter: Partial<any> = {
  //   ...query,
  //   ...objFilterUser,
  // };

  // console.log(filter);

  const contentProgress = await db.contentProgress.findMany({
    where: query,
    include: {
      ...include,
      levelProgress: { include: { chapterProgress: true } },
    },
  });

  // console.log(contentProgress);

  const result = contentProgress.filter((data) => {
    return data.levelProgress.chapterProgress.id_user === id_user;
  });

  res.json(result);
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const where = { id };

  await db.contentProgress.findUniqueOrThrow({ where });

  const contentProgress = await db.contentProgress.update({
    data: req.body,
    where,
  });
  res.status(203).json(contentProgress);
};

export const destroy = async (req: Request, res: Response) => {
  const { id } = req.params;
  const contentProgress = await db.contentProgress.delete({ where: { id } });
  res.status(204).json(contentProgress);
};
