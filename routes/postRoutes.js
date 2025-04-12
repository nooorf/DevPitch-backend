import express from "express";
import PostModel from "../models/postModel.js";
import CollaborationModel from "../models/collaborationModel.js";
import { verifyToken, verifyModerator } from "../middleware/authMiddleware.js";
import slugify from "slugify";

const router = express.Router();

//get post based on query
router.get("/", async(req, res)=>{
    try{
        const searchQuery = req.query.search || "";
        let filter = {};
        if(searchQuery){
            filter = {
                $or: [
                    {title: {$regex: searchQuery, $options: "i"}},
                    {description: {$regex: searchQuery, $options: "i"}},
                    {category: {$regex: searchQuery, $options: "i"}},
                    {tags: {$regex: searchQuery, $options: "i"}}
                ]
            }
        }
        const posts = await PostModel.find(filter)
        .populate("user", "name githubUsername profilePicture")
        .sort({createdAt: -1});
        res.json(posts);
    }
    catch(err){
        console.log("Error fetching posts: ", err);
        res.status(500).json({error: err.message});
    }
});

router.get("/reported", verifyToken, verifyModerator, async(req, res)=>{
    console.log("Middleware passed, reported route is running!");
    try{
        const reportedPosts = await PostModel.find({reportCount: {$gt: 0}}).populate("user", "name githubUsername profilePicture");
        res.json(reportedPosts);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: err.message});
    }
});

router.get("/:id", async(req, res)=>{
    try{
        const post = await PostModel.findById(req.params.id).populate("user", "name githubUsername profilePicture");
        if(!post){
            return res.status(404).json({error: "Post not found"});
        }
        res.json(post);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: err.message});
    }
});

//update view count
router.get("/views/:id", async(req, res)=>{
    try{
        console.log("backend view update route running")
        const post = await PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $inc: { views: 1 }
            },
            { new: true }
        ).populate("user", "name githubUsername profilePicture");

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

router.post("/create", verifyToken, async(req, res) => {
    try {
        console.log("Request body:", req.body);

        const { title, description, category, githubRepo, image, pitch, tags } = req.body;

        if (!title || !description || !pitch || !category || !githubRepo) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        let slug = slugify(title, { lower: true, strict: true });
        let uniqueSlug = slug;
        let count = 1;
        while (await PostModel.findOne({ slug: uniqueSlug })) {
            uniqueSlug = `${slug}-${count}`;
            count++;
        }
        const newPost = new PostModel({
            title,
            description,
            category,
            slug: uniqueSlug,
            githubRepo,
            image,
            pitch,
            user: req.user.userId,
            tags,
        });

        console.log("New post before save:", newPost);
        await newPost.save();
        console.log("Post saved successfully:", newPost);

        res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (error) {
        console.error("Error saving post:", error);
        res.status(500).json({ error: error.message });
    }
});

router.post("/:id/report", verifyToken, async (req, res) => {
    if(req.user.role === "moderator"){
        return res.status(403).json({message: "Moderators cannot report posts"});
    }
    try {
        const userId = req.user.userId;
        const post = await PostModel.findById(req.params.id);

        if (!post) {
            console.log("Post not found");
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.reports.includes(userId)) {
            console.log("User already reported this post");
            return res.status(400).json({ message: "You have already reported this post" });
        }

        post.reports.push(userId);
        post.reportCount += 1;
        await post.save();

        console.log("Post reported successfully");
        res.json({ message: "Post reported successfully" });
    } catch (err) {
        console.log("Server error:", err);
        res.status(500).json({ error: err.message });
    }
});

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

    //Send Collaboration Request to post
    router.post("/:id/collaborate", verifyToken, async (req, res) => {
        try {
            const {id: postId } = req.params;
            const userId = req.user.userId; // From auth middleware

            console.log("User ID:", userId);
            console.log("Post ID:", postId);
    
            const { name, interest, expertise, linkedin, description } = req.body;

            const post = await PostModel.findById(postId);
            if (!post) return res.status(404).json({ error: "Post not found" });
            if (post.user.toString() === userId.toString()) {
                return res.status(400).json({ error: "You cannot request collaboration on your own post." });
            }
    
            const newRequest = new CollaborationModel({
                postId,
                userId,//The one who requested
                name,
                interest,
                expertise,
                linkedin,
                description
            });
    
            await newRequest.save();
    
            res.status(201).json({ message: "Collaboration request sent successfully", request: newRequest });
        } catch (err) {
            console.error("Error sending collaboration request:", err);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    
    
export default router;