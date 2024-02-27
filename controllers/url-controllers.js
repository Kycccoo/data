import url from "../models/url-model.js";
import { StatusCodes } from "http-status-codes";
import validator from "validator";
import mongoose from "mongoose";
import axios from "axios";
import cheerio from "cheerio";

export const create = async (req, res) => {
  try {
    // req.body.image = req.file.path;
    const result = await url.create({
      title: req.body.title,
      user: req.user._id,
    });
    res.status(StatusCodes.OK).json({
      success: true,
      message: "",
      result,
    });
  } catch (error) {
    console.log(error);
    if (error.name === "ValidationError") {
      const key = Object.keys(error.errors)[0];
      const message = error.errors[key].message;
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "未知錯誤",
      });
    }
  }
};

export const getMy = async (req, res) => {
  try {
    const result = await url.find({ user: req.user._id });
    res.status(StatusCodes.OK).json({
      success: true,
      message: "",
      result,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "未知錯誤",
    });
  }
};

export const addUrl = async (req, res) => {
  try {
    const result = await url.findById(req.params.id);
    result.urls.push(req.body);
    await result.save();
    res.status(StatusCodes.OK).json({
      success: true,
      message: "",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "未知錯誤",
    });
  }
};

export const edit = async (req, res) => {
  try {
    console.log(req.params.id);
    if (!validator.isMongoId(req.params.id)) throw new Error("ID");
    const result = await url
      .findById(req.params.id)
      .orFail(new Error("NOT FOUND"));
    const idx = result.urls.findIndex(
      (u) => u._id.toString() === req.params.uid
    );
    result.urls[idx].title = req.body.title;
    result.urls[idx].url = req.body.url;
    result.urls[idx].description = req.body.description;
    await result.save();
    res.status(StatusCodes.OK).json({
      success: true,
      message: "",
    });
  } catch (error) {
    console.log(error);
    if (error.name === "CastError" || error.message === "ID") {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "ID 格式錯誤",
      });
    } else if (error.message === "NOT FOUND") {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "查無書籤",
      });
    } else if (error.name === "ValidationError") {
      const key = Object.keys(error.errors)[0];
      const message = error.errors[key].message;
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message,
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "未知錯誤",
      });
    }
  }
};

// controllers/bookmarkController.js
export const deleteBookmark = async (req, res) => {
  try {
    const { id, uid } = req.params;

    // 刪除書籤
    const result = await url.findByIdAndUpdate(
      id,
      { $pull: { urls: { _id: uid } } },
      { new: true }
    );

    if (!result) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "找不到書籤",
      });
    } else {
      res.status(StatusCodes.OK).json({
        success: true,
        message: "書籤刪除成功",
      });
    }
  } catch (error) {
    console.error(error);
    if (error.name === "CastError") {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "ID 格式錯誤",
      });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "未知錯誤",
      });
    }
  }
};
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // 确保 id 是有效的 ObjectID
    const validObjectId = mongoose.isValidObjectId(id);
    if (!validObjectId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    // 使用 $pull 操作符将整个分类删除
    const result = await url.findByIdAndDelete(id);

    if (!result) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Category not found",
      });
    }

    // 顯示刪除成功的消息
    res.status(StatusCodes.OK).json({
      success: true,
      message: "分類刪除成功",
    });
  } catch (error) {
    console.error(error); // 在控制台输出错误信息
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "未知錯誤",
    });
  }
};

export const getTitle = async (req, res) => {
  const { url } = req.params;

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const title = $("title").text();

    res.json({ title });
  } catch (error) {
    console.error("Error fetching title:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const toggleButtonColor = async (req, res) => {
  const { urlId, buttonId } = req.params;
  const { newButtonState } = req.body;

  try {
    const foundUrl = await url.findById(urlId);

    if (!foundUrl) {
      return res.status(404).json({ message: "未找到对应的 URL" });
    }

    // 找到对应的 urlSchema，并更新其中的 buttonStates 字段
    const urlSchema = foundUrl.urls.find((u) => u._id.toString() === buttonId);
    if (urlSchema) {
      urlSchema.buttonStates = newButtonState;

      // 保存修改后的 url 到数据库
      await foundUrl.save();

      res.status(200).json({ message: "按钮状态更新成功" });
    } else {
      return res.status(404).json({ message: "未找到对应的按钮" });
    }
  } catch (error) {
    console.error("按钮状态更新失败", error);
    res.status(500).json({ message: "按钮状态更新失败" });
  }
};

export const moveToTop = async (req, res) => {
  try {
    const { bookmarkId, categoryId } = req.params;

    console.log("Received bookmarkId:", bookmarkId);
    console.log("Received categoryId:", categoryId);

    // 找到被點擊的分類在 urls 中的位置
    const categoryIndex = await url.findById(categoryId);

    if (categoryIndex) {
      // 找到被點擊的書籤在分類中的位置
      const bookmarkIndex = categoryIndex.urls.findIndex(
        (u) => u._id.toString() === bookmarkId
      );
      // 移動書籤到分類的最前面
      if (bookmarkIndex !== -1) {
        const movedBookmark = categoryIndex.urls.splice(bookmarkIndex, 1)[0];
        categoryIndex.urls.unshift(movedBookmark);

        // 保存更新後的數據到數據庫
        await categoryIndex.save();

        // 將更新後的數據發送回前端
        res.status(StatusCodes.OK).json({
          success: true,
          message: "書籤移動到頂部成功",
        });
      } else {
        throw new Error("書籤未找到");
      }
    } else {
      throw new Error("分類未找到");
    }
  } catch (error) {
    console.error("移動書籤時發生錯誤:", error.message);
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "移動書籤時發生錯誤",
    });
  }
};

export const getUserBookmarks = async (req, res) => {
  const { userId } = req.params;
  console.log(userId);
  try {
    const bookmarks = await url.find({
      user: new mongoose.Types.ObjectId(userId),
    });

    res.status(StatusCodes.OK).json({ success: true, bookmarks });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "未知錯誤",
    });
  }
};
