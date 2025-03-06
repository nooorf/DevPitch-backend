import mongoose from "mongoose";
const profuserSchema = new mongoose.Schema({
    email: {type: String, unique: true, required: true}
});
const profuserModel = mongoose.model("profusers", profuserSchema);
export default profuserModel;