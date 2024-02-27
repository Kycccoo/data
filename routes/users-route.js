import { Router } from "express";
import {
  create,
  login,
  logout,
  extend,
  getProfile,
  editUrl,
  getUrl,
} from "../controllers/user-controllers.js";
import * as auth from "../middlewares/auth.js";
import passport from "passport";
import express from "express";

const router = Router();

router.post("/", create);
router.post("/login", auth.login, login);
router.delete("/logout", auth.jwt, logout);
router.patch("/extend", auth.jwt, extend);
router.get("/me", auth.jwt, getProfile);
router.patch("/url", auth.jwt, editUrl);
router.get("/url", auth.jwt, getUrl);
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
// 在路由中設定 Google 登入回調接口
router.get(
  "/auth/google/redirect",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // 登入成功後的處理
    res.redirect("/dashboard"); // 導向到登入後的頁面
  }
);

export default router;
