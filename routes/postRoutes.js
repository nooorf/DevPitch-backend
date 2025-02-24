import express from "express";
import PostModel from "../models/postModel.js";

const router = express.Router();

//TODO: create verifytoken and verifymoderator middleware and route for user to delete their own posts
//TODO: functionality for editing posts (only by the user who created the post)
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
        const {title, description, category, githubRepo, image, pitch, tags} = req.body;
        if(!title || !description || !pitch || !category || !githubRepo){
            return res.status(400).json({message: "Missing required fields"});}
        const post = new PostModel({
            title,
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
    catch(error){
        console.log(error);
        res.status(500).json({error: error.message});
    }
});

router.post("/:id/report", authMiddleware, async(req, res)=>{
    try{
        const {userId} = req.user;
        const post = await PostModel.findById(req.params.id);
        if(!post){
            return res.status(404).json({message: "Post not found"});
        }

        if(post.reports.includes(userId)){
            return res.status(400).json({message: "You have already reported this post"});
        }

        post.reports.push(userId);
        post.reportCount +=1;
        await post.save();
        res.json({message: "Post reported successfully"});
    }
    catch(err){
        console.log(err);
        res.status(400).json({err: err.message})
    }
})

//create middleware
router.get("/reported", verifyToken, verifyModerator, async(req, res)=>{
    try{
        const reportedPosts = await PostModel.find({reportCount: {$gt: 0}}).populate("user", "name githubUsername");
        res.json(reportedPosts);
    }
    catch(err){
        console.log(err);
        res.status(400).json({err: err.message});
    }
})

router.delete("/:id", verifyToken, verifyModerator, async(req, res)=>{
    try{
        const post = await PostModel.findByIdAndDelete(req.body.id);
        if(!post){
            return res.status(404).json({message: "Post not found"});
        }
        res.json({message: "Post deleted successfully"});
    }
    catch(err){
        console.log(err);
        res.status(400).json({err: err.message});}
    });
export default router;