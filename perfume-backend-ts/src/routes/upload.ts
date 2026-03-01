import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { verifyToken } from "../middleware/auth";

const router = Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

// File filter - only images
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, PNG, GIF, WEBP) are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// POST /upload - upload a single image
router.post("/", verifyToken, upload.single("image"), (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ message: "No image file provided." });
    return;
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

export default router;
