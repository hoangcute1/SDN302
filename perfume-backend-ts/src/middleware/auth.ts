import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Member, { IMember } from "../models/Member";

const JWT_SECRET = process.env.JWT_SECRET || "perfume_secret_key_2026";

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      member?: IMember;
    }
  }
}

// Generate JWT token
export const generateToken = (member: IMember): string => {
  return jwt.sign(
    { id: member._id, email: member.email, isAdmin: member.isAdmin },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Verify token middleware
export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Access denied. No token provided." });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const member = await Member.findById(decoded.id);

    if (!member) {
      res.status(401).json({ message: "Invalid token. Member not found." });
      return;
    }

    req.member = member;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token." });
  }
};

// Optional auth - sets req.member if token is present but doesn't block
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const member = await Member.findById(decoded.id);
      if (member) {
        req.member = member;
      }
    }
    next();
  } catch {
    next();
  }
};

// Admin check middleware (must be used after verifyToken)
export const verifyAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.member || !req.member.isAdmin) {
    res.status(403).json({ message: "Access denied. Admin only." });
    return;
  }
  next();
};
