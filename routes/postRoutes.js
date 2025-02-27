import express from "express";
import PostModel from "../models/postModel.js";
import { verifyToken, verifyModerator } from "../middleware/authMiddleware.js";

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
            return res.status(404).json({error: "Post not found"});
        }
        res.json(post);
    }
    catch(err){
        console.log(err);
    }
})

//update like count
router.post("/:id/like", verifyToken, async(req, res)=>{
    try{
        const userId = req.user.userId;
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

router.post("/create", verifyToken, async(req, res)=>{
    try{
        const {title, description, category, githubRepo, image, pitch, tags} = req.body;
        if(!title || !description || !pitch || !category || !githubRepo){
            return res.status(400).json({message: "Missing required fields"});}
        const newPost = new PostModel({
            title,
            description,
            category,
            githubRepo,
            image,
            pitch,
            user: req.user.userId,
            tags,
        });
        await newPost.save();
        res.status(201).json({message: "Post created successfully", post: newPost});
    }
    catch(error){
        console.log(error);
        res.status(500).json({error: error.message});
    }
});

router.post("/:id/report", verifyToken, async(req, res)=>{
    try{
        const userId = req.user.userId;
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
        res.status(500).json({erorr: err.message})
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
        res.status(500).json({error: err.message});
    }
})

router.delete("/:id", verifyToken, verifyModerator, async(req, res)=>{
    try{
        const post = await PostModel.findByIdAndDelete(req.params.id);
        if(!post){
            return res.status(404).json({message: "Post not found"});
        }
        res.json({message: "Post deleted successfully"});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: err.message});}
    });

    //allow users to edit their created posts
    router.put("/:id/edit", verifyToken, async (req, res) => {
        try {
            const { title, description, category, githubRepo, image, pitch, tags } = req.body;
    
            const post = await PostModel.findById(req.params.id);
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
    
            if (post.user.toString() !== req.user.userId) {
                return res.status(403).json({ message: "Unauthorized: You can only edit your own posts" });
            }
    
            post.title = title || post.title;
            post.description = description || post.description;
            post.category = category || post.category;
            post.githubRepo = githubRepo || post.githubRepo;
            post.image = image || post.image;
            post.pitch = pitch || post.pitch;
            post.tags = tags || post.tags;
    
            await post.save();
            res.json({ message: "Post updated successfully", post });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: err.message });
        }
    });
    
    //allow users to delete their own posts
    router.delete("/:id/delete", verifyToken, async (req, res) => {
        try {
            const post = await PostModel.findById(req.params.id);
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
    
            if (post.user.toString() !== req.user.userId) {
                return res.status(403).json({ message: "Unauthorized: You can only delete your own posts" });
            }
    
            await PostModel.findByIdAndDelete(req.params.id);
            res.json({ message: "Post deleted successfully" });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: err.message });
        }
    });
    //allow moderator to review and keep post
    router.put("/:id", verifyToken, verifyModerator, async(req, res)=>{
        try{
            const post = await PostModel.findByIdAndUpdate(req.params.id);
            if(!post){
                return res.status(404).json({message: "Post not found"});
            }
            else{
                post.reportCount = 0;
                post.reports = [];
                await post.save();
                res.json({message: "Post reports cleared"});
            }
        }
        catch(err){
            console.log(err);
            res.status(500).json({error: err.message});}
    });
    //to fetch posts by user id
    router.get("/users/:id/posts", async(req, res)=>{
        try{
            const posts = await PostModel.find({user: req.params.id});
            res.json(posts);
        }
        catch(err){
            console.log(err);
            res.status(500).json({error: err.message});
        }
    });
    
export default router;