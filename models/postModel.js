import mongoose from "mongoose";
import slugify from "slugify";
const postSchema = new mongoose.Schema({
    title: {type: String, required: true},
    slug: {type: String, required: true},
    description: {type: String, required: true},
    category: { type: String },
    githubRepo: String,
    image: {type: String, default: "https://via.placeholder.com/150"},
    pitch: {type: String, required: true},
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" }, 
    tags: [{ type: String, lowercase: true, trim: true }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "users"}], 
    views: { type: Number, default: 0 }, 
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "users"}],
    reportCount: { type: Number, default: 0 },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const PostModel = mongoose.models.posts || mongoose.model("posts", postSchema);
export default PostModel;