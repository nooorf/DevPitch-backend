import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import CollaborationRequest from "../models/collaborationModel.js";
import Post from "../models/postModel.js";

const router = express.Router();

// Get all collaboration requests RECEIVED on user's posts
router.get("/request/received", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("User ID:", userId);

    const userPosts = await Post.find({ user: userId }).select("_id");
    const postIds = userPosts.map((post) => post._id);

    const receivedRequests = await CollaborationRequest.find({ postId: { $in: postIds } })
      .populate("postId", "title")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ receivedRequests });
  } catch (err) {
    console.error("Error fetching received collaboration requests:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all collaboration requests SENT by the user
router.get("/request/sent", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("User ID:", userId);
    const sentRequests = await CollaborationRequest.find({ userId })
      .populate("postId", "title")
      .sort({ createdAt: -1 });

      console.log("Sent Requests:", sentRequests);
    res.status(200).json({ sentRequests });
  } catch (err) {
    console.error("Error fetching sent collaboration requests:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
