import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/auth";
import brandRoutes from "./routes/brands";
import perfumeRoutes from "./routes/perfumes";
import memberRoutes from "./routes/members";
import postRoutes from "./routes/posts";
import uploadRoutes from "./routes/upload";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/auth", authRoutes);
app.use("/brands", brandRoutes);
app.use("/perfumes", perfumeRoutes);
app.use("/members", memberRoutes);
app.use("/collectors", memberRoutes);
app.use("/posts", postRoutes);
app.use("/upload", uploadRoutes);

// Health check
app.get("/", (_req, res) => {
  res.json({ message: "Perfume API is running" });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

export default app;
