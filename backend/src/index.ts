import express from "express";
import cors from "cors";
import { router as visionRouter } from "./routes/vision";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ 讓前端能載入上傳的圖片
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api", visionRouter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
