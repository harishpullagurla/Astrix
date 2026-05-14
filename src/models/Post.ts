import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPost extends Document {
  title: string;
  content: string;
  category: 
    | "Resource" 
    | "Exam Tip" 
    | "Professor Insight" 
    | "Skill Development" 
    | "Internship Preparation" 
    | "General Advice";
  tags: string[];
  author: mongoose.Types.ObjectId;
  upvotes: mongoose.Types.ObjectId[];
  reports: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { 
      type: String, 
      enum: [
        "Resource", 
        "Exam Tip", 
        "Professor Insight", 
        "Skill Development", 
        "Internship Preparation", 
        "General Advice"
      ], 
      required: true 
    },
    tags: [{ type: String }],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    reports: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

export default Post;
