import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    githubId: { type: String, unique: true, required: true },
    githubUsername: {type: String, unique: true, required: true},
    email: {type: String, unique: true, required: true},
    profilePicture: {type: String, default: "https://via.placeholder.com/150"},
    bio: {type: String, default: "No bio provided"},
    role: {type: String, enum: ["student", "moderator"], default: "student"},
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const UserModel = mongoose.model("users", userSchema);
export default UserModel;