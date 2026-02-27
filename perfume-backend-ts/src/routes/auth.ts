import { Router, Request, Response } from "express";
import Member from "../models/Member";
import { generateToken, verifyToken } from "../middleware/auth";

const router = Router();

// POST /auth/register
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, YOB, gender } = req.body;

    if (!email || !password || !name || !YOB) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }

    const existing = await Member.findOne({ email });
    if (existing) {
      res.status(409).json({ message: "Email already exists." });
      return;
    }

    const member = new Member({
      email,
      password,
      name,
      YOB,
      gender: gender ?? true,
      isAdmin: false, // default role is not Admin
    });

    await member.save();
    const token = generateToken(member);

    res.status(201).json({
      message: "Registration successful.",
      token,
      member: member.toJSON(),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const member = await Member.findOne({ email });
    if (!member) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const isMatch = await member.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const token = generateToken(member);

    res.json({
      message: "Login successful.",
      token,
      member: member.toJSON(),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /auth/profile
router.get("/profile", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(req.member!.toJSON());
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /auth/profile - member can edit own info
router.put("/profile", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, YOB, gender } = req.body;
    const member = await Member.findById(req.member!._id);
    if (!member) {
      res.status(404).json({ message: "Member not found." });
      return;
    }

    if (name !== undefined) member.name = name;
    if (YOB !== undefined) member.YOB = YOB;
    if (gender !== undefined) member.gender = gender;

    await member.save();
    res.json({ message: "Profile updated.", member: member.toJSON() });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /auth/change-password
router.put("/change-password", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: "Current and new password are required." });
      return;
    }

    const member = await Member.findById(req.member!._id);
    if (!member) {
      res.status(404).json({ message: "Member not found." });
      return;
    }

    const isMatch = await member.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({ message: "Current password is incorrect." });
      return;
    }

    member.password = newPassword;
    await member.save();
    res.json({ message: "Password changed successfully." });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
