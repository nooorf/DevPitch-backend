import express from "express";
import PostModel from "../models/postModel.js";

const router = express.Router();

//update view count
router.get("/:id", async(req, res)=>{
    try{
        const post = await PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $inc: { views: 1 }
            },
            { new: true }
        ).populate("user", "name githubUsername");

        if(!post){
            return res.status(404).json({message: "Post not found"});
        }
        res.json(post);
    }
    catch(err){
        console.log(err);
    }
})

//update like count
router.post("/:id/like", authMiddleware, async(req, res)=>{
    try{
        const userId = req.body.userId;
        const post = await PostModel.findById(req.params.id);
        if(!post){
            return res.status(404).json({message: "Post not found"});
        }

        const index = post.likes.indexOf(userId);
        if(index === -1){
            post.likes.push(userId);
        }
        else{
            post.likes.splice(index, 1);
        }
        await post.save();
        res.json({likes: post.likes.length});
    }
    catch(err){
        console.log(err);
    }
})

router.post("/create", authMiddleware, async(req, res)=>{
    try{
        const {title, slug, description, category, githubRepo, image, pitch, tags} = req.body;
        if(!title || !slug || !description || !pitch || !category || !githubRepo){
            return res.status(400).json({message: "Missing required fields"});}
        const post = new PostModel({
            title,
            slug,
            description,
            category,
            githubRepo,
            image,
            pitch,
            user: req.user.userId,
            tags,
        });
        await post.save();
        res.status(200).json({message: "Post created successfully", post: newPost});
    }
    catch(err){
        console.log(err);
        res.status(500).json({message: error.message});
    }
})

export default router;