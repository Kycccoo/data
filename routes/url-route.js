import { Router } from "express";
import * as auth from "../middlewares/auth.js";
import {
  create,
  getMy,
  addUrl,
  //   getAll,
  edit,
  //   get,
  //   getId,
  getTitle,
  deleteBookmark, // 引入刪除書籤的控制器
  deleteCategory, // 引入刪除分類的控制器
  toggleButtonColor,
  moveToTop,
  getUserBookmarks,
} from "../controllers/url-controllers.js";
import upload from "../middlewares/upload.js";
import admin from "../middlewares/admin.js";

const router = Router();

router.post("/", auth.jwt, create);
router.get("/me", auth.jwt, getMy);
router.post("/:id/urls", auth.jwt, addUrl);
router.patch("/:id/:uid", auth.jwt, admin, edit);
router.delete("/:id/:uid", auth.jwt, admin, deleteBookmark); // 添加刪除書籤的路由
router.delete("/:id", auth.jwt, admin, deleteCategory); // 添加刪除分類的路由
router.get("/getTitle/:url", getTitle);
router.patch("/:urlId/button/:buttonId", auth.jwt, toggleButtonColor);
router.patch("/:categoryId/moveToTop/:bookmarkId", auth.jwt, admin, moveToTop);
router.get("/getUserBookmarks/:userId", auth.jwt, admin, getUserBookmarks);
// router.get("/", get);
// router.get("/:id", getId);

export default router;
