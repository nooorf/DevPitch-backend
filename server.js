import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import UserModel from "./models/UserModel.js";

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