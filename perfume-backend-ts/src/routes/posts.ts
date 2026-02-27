import { Router, Request, Response } from "express";
import Post from "../models/Post";
import { verifyToken } from "../middleware/auth";

const router = Router();

// GET /posts - public, get all posts (newest first)
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, author } = req.query;
    const filter: any = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search as string, $options: "i" } },
        { content: { $regex: search as string, $options: "i" } },
        { tags: { $regex: search as string, $options: "i" } },
      ];
    }
    if (author) {
      filter.author = author;
    }

    const posts = await Post.find(filter)
      .populate("author", "name email")
      .populate("perfume", "perfumeName uri")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// GET /posts/:postId - public, get single post
router.get("/:postId", async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate("author", "name email")
      .populate("perfume", "perfumeName uri price");

    if (!post) {
      res.status(404).json({ message: "Post not found." });
      return;
    }

    res.json(post);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// POST /posts - authenticated members can create posts
router.post("/", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, image, perfume, tags } = req.body;

    if (!title || !content) {
      res.status(400).json({ message: "Title and content are required." });
      return;
    }

    const post = new Post({
      title,
      content,
      image: image || "",
      author: req.member!._id,
      perfume: perfume || null,
      tags: tags || [],
    });

    await post.save();
    const populated = await post.populate([
      { path: "author", select: "name email" },
      { path: "perfume", select: "perfumeName uri" },
    ]);

    res.status(201).json(populated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /posts/:postId - only author or admin can edit
router.put("/:postId", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      res.status(404).json({ message: "Post not found." });
      return;
    }

    // Only author or admin can edit
    if (post.author.toString() !== req.member!._id.toString() && !req.member!.isAdmin) {
      res.status(403).json({ message: "You can only edit your own posts." });
      return;
    }

    const { title, content, image, perfume, tags } = req.body;
    const updated = await Post.findByIdAndUpdate(
      req.params.postId,
      { title, content, image, perfume: perfume || null, tags: tags || [] },
      { new: true, runValidators: true }
    )
      .populate("author", "name email")
      .populate("perfume", "perfumeName uri");

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /posts/:postId - only author or admin can delete
router.delete("/:postId", verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      res.status(404).json({ message: "Post not found." });
      return;
    }

    if (post.author.toString() !== req.member!._id.toString() && !req.member!.isAdmin) {
      res.status(403).json({ message: "You can only delete your own posts." });
      return;
    }

    await Post.findByIdAndDelete(req.params.postId);
    res.json({ message: "Post deleted." });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
