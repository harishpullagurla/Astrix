import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUnlock extends Document {
  user: mongoose.Types.ObjectId;
  paper: mongoose.Types.ObjectId;
  cost: number;
  createdAt: Date;
}

const UnlockSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    paper: { type: Schema.Types.ObjectId, ref: "Resource", required: true },
    cost: { type: Number, default: 5 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Prevent duplicate unlocks
UnlockSchema.index({ user: 1, paper: 1 }, { unique: true });

const Unlock: Model<IUnlock> =
  mongoose.models.Unlock || mongoose.model<IUnlock>("Unlock", UnlockSchema);

export default Unlock;
