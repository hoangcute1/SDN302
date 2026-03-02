import { Router, Request, Response } from "express";
import Perfume from "../models/Perfume";
import { verifyToken, verifyAdmin, optionalAuth } from "../middleware/auth";

const router = Router();

// GET /perfumes - public, supports search by name and filter by brand
// Only returns approved perfumes for public. Admin sees all with ?all=true
router.get("/", optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, brand, all, pending } = req.query;
    const filter: any = {};

    // Admin can request all perfumes or only pending
    if (req.member?.isAdmin && pending === "true") {
      filter.isApproved = false;
    } else if (req.member?.isAdmin && all === "true") {
      // no filter on isApproved
    } else {
      filter.isApproved = true;
    }

    if (search) {
      filter.perfumeName = { $regex: search as string, $options: "i" };
    }
    if (brand) {
      filter.brand = brand;
    }

    const perfumes = await Perfume.find(filter)
      .populate("brand", "brandName")
      .populate("submittedBy", "name email")
      .select("perfumeName uri price concentration targetAudience brand comments isApproved submittedBy")
      .sort({ createdAt: -1 });

    res.json(perfumes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /perfumes/:perfumeId - public, detailed
router.get("/:perfumeId", async (req: Request, res: Response): Promise<void> => {
  try {
    const perfume = await Perfume.findById(req.params.perfumeId)
      .populate("brand", "brandName")
      .populate("comments.author", "name email");

    if (!perfume) {
      res.status(404).json({ message: "Perfume not found." });
      return;
    }

    res.json(perfume);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /perfumes - admin creates (auto-approved), user submits (pending approval)
router.post("/", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      perfumeName, uri, price, concentration,
      description, ingredients, volume, targetAudience, brand,
    } = req.body;

    const perfume = new Perfume({
      perfumeName, uri, price, concentration,
      description, ingredients, volume, targetAudience, brand,
      isApproved: req.member!.isAdmin ? true : false,
      submittedBy: req.member!._id,
    });

    await perfume.save();
    const populated = await perfume.populate("brand", "brandName");
    res.status(201).json(populated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /perfumes/:perfumeId/approve - admin only, approve a pending perfume
router.patch("/:perfumeId/approve", verifyToken, verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const perfume = await Perfume.findByIdAndUpdate(
      req.params.perfumeId,
      { isApproved: true },
      { new: true }
    ).populate("brand", "brandName").populate("submittedBy", "name email");

    if (!perfume) {
      res.status(404).json({ message: "Perfume not found." });
      return;
    }

    res.json(perfume);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /perfumes/:perfumeId/reject - admin only, delete a pending perfume
router.patch("/:perfumeId/reject", verifyToken, verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const perfume = await Perfume.findByIdAndDelete(req.params.perfumeId);

    if (!perfume) {
      res.status(404).json({ message: "Perfume not found." });
      return;
    }

    res.json({ message: "Perfume rejected and removed." });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /perfumes/:perfumeId - admin only
router.put("/:perfumeId", verifyToken, verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      perfumeName, uri, price, concentration,
      description, ingredients, volume, targetAudience, brand,
    } = req.body;

    const perfume = await Perfume.findByIdAndUpdate(
      req.params.perfumeId,
      { perfumeName, uri, price, concentration, description, ingredients, volume, targetAudience, brand },
      { new: true, runValidators: true }
    ).populate("brand", "brandName");

    if (!perfume) {
      res.status(404).json({ message: "Perfume not found." });
      return;
    }

    res.json(perfume);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /perfumes/:perfumeId - admin only
router.delete("/:perfumeId", verifyToken, verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const perfume = await Perfume.findByIdAndDelete(req.params.perfumeId);
    if (!perfume) {
      res.status(404).json({ message: "Perfume not found." });
      return;
    }
    res.json({ message: "Perfume deleted." });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /perfumes/:perfumeId/comments - member only, one comment per perfume
router.post("/:perfumeId/comments", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { rating, content } = req.body;
    const memberId = req.member!._id;

    if (!rating || !content) {
      res.status(400).json({ message: "Rating and content are required." });
      return;
    }

    const perfume = await Perfume.findById(req.params.perfumeId);
    if (!perfume) {
      res.status(404).json({ message: "Perfume not found." });
      return;
    }

    // Check if member already commented
    const alreadyCommented = perfume.comments.find(
      (c) => c.author.toString() === memberId.toString()
    );
    if (alreadyCommented) {
      res.status(409).json({ message: "You have already commented on this perfume." });
      return;
    }

    perfume.comments.push({ rating, content, author: memberId });
    await perfume.save();

    const updated = await Perfume.findById(perfume._id)
      .populate("brand", "brandName")
      .populate("comments.author", "name email");

    res.status(201).json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /perfumes/:perfumeId/comments/:commentId - member can edit own comment
router.put("/:perfumeId/comments/:commentId", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { rating, content } = req.body;
    const memberId = req.member!._id;

    const perfume = await Perfume.findById(req.params.perfumeId);
    if (!perfume) {
      res.status(404).json({ message: "Perfume not found." });
      return;
    }

    const comment = perfume.comments.find(
      (c) => c._id?.toString() === req.params.commentId
    );
    if (!comment) {
      res.status(404).json({ message: "Comment not found." });
      return;
    }

    if (comment.author.toString() !== memberId.toString()) {
      res.status(403).json({ message: "You can only edit your own comment." });
      return;
    }

    if (rating !== undefined) comment.rating = rating;
    if (content !== undefined) comment.content = content;

    await perfume.save();

    const updated = await Perfume.findById(perfume._id)
      .populate("brand", "brandName")
      .populate("comments.author", "name email");

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /perfumes/:perfumeId/comments/:commentId - member can delete own comment
router.delete("/:perfumeId/comments/:commentId", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const memberId = req.member!._id;

    const perfume = await Perfume.findById(req.params.perfumeId);
    if (!perfume) {
      res.status(404).json({ message: "Perfume not found." });
      return;
    }

    const commentIndex = perfume.comments.findIndex(
      (c) => c._id?.toString() === req.params.commentId
    );
    if (commentIndex === -1) {
      res.status(404).json({ message: "Comment not found." });
      return;
    }

    if (perfume.comments[commentIndex]!.author.toString() !== memberId.toString()) {
      res.status(403).json({ message: "You can only delete your own comment." });
      return;
    }

    perfume.comments.splice(commentIndex, 1);
    await perfume.save();

    res.json({ message: "Comment deleted." });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
