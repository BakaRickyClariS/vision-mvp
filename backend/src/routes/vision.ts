import express from "express";
import multer from "multer";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { PrismaClient } from "@prisma/client";
import path from "path";

export const router = express.Router();
const prisma = new PrismaClient();
const client = new ImageAnnotatorClient();

const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (_req, file, cb) => {
      const unique = Date.now() + path.extname(file.originalname);
      cb(null, unique);
    },
  }),
});

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { type } = req.body;
    const imagePath = req.file?.path || "";
    let result;

    if (type === "invoice") {
      [result] = await client.textDetection(imagePath);
    } else {
      [result] = await client.labelDetection(imagePath);
    }

    // ✅ 轉成純 JSON，確保 Prisma 可接受
    const resultJson = JSON.parse(JSON.stringify(result));

    const saved = await prisma.visionResult.create({
      data: {
        type,
        imageUrl: imagePath,
        resultJson, // ✅ 改這裡
      },
    });

    res.json({ success: true, data: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "辨識失敗" });
  }
});

router.get("/results", async (_req, res) => {
  const results = await prisma.visionResult.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(results);
});
