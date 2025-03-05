import express from 'express';
import UserModel from '../models/userModel.js';

const router = express.Router();

router.get("/", async (req, res) => {
    const userData = await UserModel.find();
    res.json(userData);
});

//fetch posts based on user id
router.get("/:id/posts", async (req, res) => {
    try {
      const { id } = req.params;
      
      const posts = await PostModel.find({ user: id }).populate("user", "name email"); 
  
      res.status(200).json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

export default router;