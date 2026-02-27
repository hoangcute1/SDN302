import { Router, Request, Response } from "express";
import Member from "../models/Member";
import { verifyToken, verifyAdmin } from "../middleware/auth";

const router = Router();

// GET /members - admin only, returns all members
router.get("/", verifyToken, verifyAdmin, async (_req: Request, res: Response): Promise<void> => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /members/:memberId - admin only
router.get("/:memberId", verifyToken, verifyAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const member = await Member.findById(req.params.memberId);
    if (!member) {
      res.status(404).json({ message: "Member not found." });
      return;
    }
    res.json(member);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
