import express from "express";

import * as progress from "../controller/statistics/userStatistics";
import * as statistics from "../controller/statistics/gameStatistics";

import { authorization } from "../middleware/isAuttenticate";
import { verifyPermission } from "../middleware/verifyPermission";

export const router = express.Router();

router
  .route("/progress/me")
  .post(authorization, progress.generateProgress)
  .get(authorization,  progress.generateProgress);
  // .get(authorization, progress.getProgress, progress.generateProgress);

router.get(
  "/statistics/allPlayers",
  authorization,
  verifyPermission,
  statistics.playerStats
);

router.get(
  "/statistics/chapter",
  authorization,
  verifyPermission,
  statistics.chapterStats
);

router.get(
  "/statistics/chapter/:id",
  authorization,
  verifyPermission,
  statistics.chapterStats
);

router.get(
  "/statistics/level",
  authorization,
  verifyPermission,
  statistics.levelStats
);

router.get(
  "/statistics/level/:id",
  authorization,
  verifyPermission,
  statistics.levelStats
);

router.get(
  "/statistics/content",
  authorization,
  verifyPermission,
  statistics.contentStats
);

router.get(
  "/statistics/content/:id",
  authorization,
  verifyPermission,
  statistics.contentStats
);
