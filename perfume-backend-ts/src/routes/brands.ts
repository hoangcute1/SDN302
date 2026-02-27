import { Router, Request, Response } from "express";
import Brand from "../models/Brand";
import { verifyToken, verifyAdmin } from "../middleware/auth";

const router = Router();

// GET /brands - public
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const brands = await Brand.find().sort({ brandName: 1 });
    res.json(brands);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /brands/:brandId - public
router.get("/:brandId", async (req: Request, res: Response): Promise<void> => {
  try {
    const brand = await Brand.findById(req.params.brandId);
    if (!brand) {
      res.status(404).json({ message: "Brand not found." });
      return;
    }
    res.json(brand);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /brands - admin only
router.post("/", verifyToken, verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { brandName } = req.body;
    if (!brandName) {
      res.status(400).json({ message: "Brand name is required." });
      return;
    }
    const brand = new Brand({ brandName });
    await brand.save();
    res.status(201).json(brand);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /brands/:brandId - admin only
router.put("/:brandId", verifyToken, verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { brandName } = req.body;
    const brand = await Brand.findByIdAndUpdate(
      req.params.brandId,
      { brandName },
      { new: true, runValidators: true }
    );
    if (!brand) {
      res.status(404).json({ message: "Brand not found." });
      return;
    }
    res.json(brand);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /brands/:brandId - admin only
router.delete("/:brandId", verifyToken, verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.brandId);
    if (!brand) {
      res.status(404).json({ message: "Brand not found." });
      return;
    }
    res.json({ message: "Brand deleted." });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
