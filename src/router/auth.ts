import express from "express";

import * as auth from "../controller/auth/auth";
import * as user from "../controller/auth/user";
import * as admin from "../controller/auth/admin";
import * as player from "../controller/auth/player";

import { authorization } from "../middleware/isAuttenticate";
import { verifyPermission } from "../middleware/verifyPermission";
import {
  changePassword,
  generateCode,
  verifyCode,
  verifyKey,
} from "../controller/auth/recoveryPassword";
import { upload } from "../upload";

export const router = express.Router();

router.post("/register/anonymous", auth.registerAnonymous);
router.post("/register", auth.register);
router.post("/login", auth.login);

router.post("/send-email", generateCode);
router.post("/key-exists", verifyKey);
router.post("/verify-code", verifyCode);
router.post("/change-password", changePassword);

router
  .route("/user/me")
  .get(authorization, user.getById)
  .patch(authorization, user.update)
  .delete(authorization, user.destroy);

router.post("/user/me/works", authorization, user.updateWork);

router.post(
  "/user/me/picture",
  authorization,
  upload.single("picture"),
  user.updateImage
);

router.route("/player").get(authorization, player.handleAccess, player.getAll);

router
  .route("/player/:id_user")
  .get(authorization, player.handleAccess, player.getById)
  .patch(authorization, player.handleAccess, player.update)
  .delete(authorization, player.handleAccess, player.destroy);

// router.put("/player/:id_user/works", authorization, user.updateWork);

router
  .route("/admin")
  .post(authorization, verifyPermission, admin.create)
  .get(authorization, verifyPermission, admin.getAll);

router
  .route("/admin/:id_user")
  .get(authorization, verifyPermission, admin.getById)
  .patch(authorization, verifyPermission, admin.update)
  .delete(authorization, verifyPermission, admin.destroy);
