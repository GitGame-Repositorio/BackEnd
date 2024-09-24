import express from "express";

import * as chapterProgress from "../controller/progress/chapterProgress";
import * as levelProgress from "../controller/progress/levelProgress";
import * as contentProgress from "../controller/progress/contentProgress";

import { authorization } from "../middleware/isAuttenticate";
import { verifyPermission } from "../middleware/verifyPermission";

export const router = express.Router();

const generateRoutersGame = (path, controller) => {
  router
    .route(path)
    .post(
      authorization,
      controller.handleAccessAdmin,
      controller.handleAccessUser,
      controller.create
    )
    .get(
      authorization,
      verifyPermission,
      controller.handleAccessAdmin,
      controller.handleAccessUser,
      controller.getAll
    );

  router
    .route(`${path}/:id`)
    .get(
      authorization,
      controller.handleAccessAdmin,
      controller.handleAccessUser,
      controller.getById
    )
    .patch(
      authorization,
      controller.handleAccessAdmin,
      controller.handleAccessUser,
      controller.update
    )
    .delete(
      authorization,
      controller.handleAccessAdmin,
      controller.handleAccessUser,
      controller.destroy
    );

  const progressMeURL = "/progress" + path + "/me";
  router.get(
    progressMeURL,
    authorization,
    (req, res, next) => {
      req.query.id_user = req.userId;
      return next();
    },
    controller.getAll
  );
};

generateRoutersGame("/chapter_progress", chapterProgress);
generateRoutersGame("/level_progress", levelProgress);
generateRoutersGame("/content_progress", contentProgress);
