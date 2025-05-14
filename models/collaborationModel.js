import mongoose from "mongoose";

const collaborationRequestSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", 
      required: true
    },
    name: String,
    interest: String,
    expertise: String,
    github: String,
    description: String,
  },
  { timestamps: true }
);

const CollaborationRequest = mongoose.model("CollaborationRequest", collaborationRequestSchema);
export default CollaborationRequest;
