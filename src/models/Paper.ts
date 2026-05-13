import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPaper extends Document {
  title: string;
  subjectCode: string;
  year: number;
  semester: number;
  examType: "Mid-Sem" | "End-Sem" | "Other";
  fileUrl: string;
  fileSize: number; // in bytes
  uploader: mongoose.Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const PaperSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    subjectCode: { type: String, required: true, uppercase: true },
    year: { type: Number, required: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    examType: { 
      type: String, 
      enum: ["Mid-Sem", "End-Sem", "Other"], 
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
PaperSchema.index({ subjectCode: 1, year: 1, semester: 1 });

const Paper: Model<IPaper> =
  mongoose.models.Paper || mongoose.model<IPaper>("Paper", PaperSchema);

export default Paper;
