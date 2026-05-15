import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const ResourceSchema = new mongoose.Schema({
  title: String,
  fileUrl: String,
  fileHash: String,
});

const Resource = mongoose.models.Resource || mongoose.model("Resource", ResourceSchema);

async function syncHashes() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URI);
    
    const resources = await Resource.find({ fileHash: { $exists: false } });
    console.log(`Found ${resources.length} resources without hashes.`);

    for (const res of resources) {
      try {
        // Remove leading slash if present
        const cleanUrl = res.fileUrl.startsWith("/") ? res.fileUrl.substring(1) : res.fileUrl;
        const filePath = path.join(process.cwd(), "public", cleanUrl);
        
        const buffer = await fs.readFile(filePath);
        const hash = crypto.createHash("sha256").update(buffer).digest("hex");
        
        await Resource.findByIdAndUpdate(res._id, { fileHash: hash });
        console.log(`✅ Hashed: ${res.title}`);
      } catch (err) {
        console.warn(`⚠️ Skipping ${res.title}: ${err.message}`);
      }
    }

    console.log("Sync complete!");
    process.exit(0);
  } catch (err) {
    console.error("Critical Error:", err);
    process.exit(1);
  }
}

syncHashes();
