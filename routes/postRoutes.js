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