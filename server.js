import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import UserModel from "./models/UserModel.js";
import PostModel from "./models/postModel.js";

const app = express();
dotenv.config();
const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => {  
    console.log("Connected to MongoDB");
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
})
.catch((err) => {
    console.log(err);
});


app.get("/getusers", async (req, res) => {
    const userData = await UserModel.find();
    res.json(userData);
});

//update view count
app.get("/posts/:id", async(req, res)=>{
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
app.post("/posts/:id/like", async(req, res)=>{
    try{
        //github auth not yet set up. So, userId is passed in the body
        //TODO: extract userId from auth token using middleware
        const {userId} = req.body;
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