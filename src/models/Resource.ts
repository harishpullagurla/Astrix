import mongoose, { Schema, Document, Model } from "mongoose";

export interface IResource extends Document {
  title: string;
  subjectCode: string;
  year: number;
  semester: number;
  resourceType: 
    | "Mid-Sem Paper" 
    | "End-Sem Paper" 
    | "Quiz Paper" 
    | "Notes" 
    | "Lecture Slides" 
    | "Reference Material" 
    | "Assignment" 
    | "Tutorial" 
    | "Lab Manual" 
    | "Weekly Lab Sheet" 
    | "Viva Questions" 
    | "Cheat Sheet" 
    | "Useful PDF" 
    | "Other";
  fileUrl: string;
  fileSize: number; // in bytes
  uploader: mongoose.Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    subjectCode: { type: String, required: true, uppercase: true },
    year: { type: Number, required: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    resourceType: { 
      type: String, 
      enum: [
        "Mid-Sem Paper", 
        "End-Sem Paper", 
        "Quiz Paper", 
        "Notes", 
        "Lecture Slides", 
        "Reference Material", 
        "Assignment", 
        "Tutorial", 
        "Lab Manual", 
        "Weekly Lab Sheet", 
        "Viva Questions", 
        "Cheat Sheet", 
        "Useful PDF", 
        "Other"
      ], 
      required: true 
    },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, required: true },
    uploader: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { 
      type: String, 
      enum: ["pending", "approved", "rejected"], 
      default: "approved" // Auto-approve for MVP
    },
  },
  { timestamps: true }
);

// Indexing for faster searches
ResourceSchema.index({ subjectCode: 1, year: 1, semester: 1 });

const Resource: Model<IResource> =
  mongoose.models.Resource || mongoose.model<IResource>("Resource", ResourceSchema);

export default Resource;
