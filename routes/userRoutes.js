import express from 'express';
import UserModel from '../models/userModel.js';
import PostModel from '../models/postModel.js';

const router = express.Router();

router.get("/", async (req, res) => {
    const userData = await UserModel.find();
    res.json(userData);
});

//fetch user details by id
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
    }
});

//fetch posts based on user id
router.get("/:id/posts", async (req, res) => {
    try {
      const { id } = req.params;
      
      const posts = await PostModel.find({ user: id }).populate("user", "name email profilePicture"); 
  
      res.status(200).json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

export default router;