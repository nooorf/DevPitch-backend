import mongoose from "mongoose";
const profuserSchema = new mongoose.Schema({
    email: {type: String, unique: true, required: true},
    username: {type: String, unique:true, required: true},
    bio: {type: String},
    pfp: {type: String, default: "https://via.placeholder.com/150"},
});
const profuserModel = mongoose.model("profusers", profuserSchema);
export default profuserModel;