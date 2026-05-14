const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define temporary schemas to match the app (since we can't easily import TS files in a JS script)
const ResourceSchema = new mongoose.Schema({
  title: String,
  subjectCode: String,
  year: Number,
  semester: Number,
  resourceType: String,
  fileUrl: String,
  fileSize: Number,
  uploader: mongoose.Schema.Types.ObjectId,
  status: { type: String, default: 'approved' }
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  image: String,
  coins: Number,
  role: String
}, { timestamps: true });

const Resource = mongoose.models.Resource || mongoose.model('Resource', ResourceSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Please set MONGODB_URI in .env.local");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    // 1. Create/Find Dummy Uploader
    let bot = await User.findOne({ email: "bot@iiitdmj.ac.in" });
    if (!bot) {
      bot = await User.create({
        name: "Community Bot",
        email: "bot@iiitdmj.ac.in",
        image: "https://api.dicebear.com/7.x/bottts/svg?seed=Astrix",
        coins: 1000,
        role: "student"
      });
      console.log("Created Community Bot");
    }

    // 2. Create test resources
    const testResources = [
      {
        title: "Data Structures End-Sem 2022",
        subjectCode: "CS201",
        year: 2022,
        semester: 3,
        resourceType: "End-Sem Paper",
        fileUrl: "/uploads/sample.pdf",
        fileSize: 1024 * 1024,
        uploader: bot._id,
        status: "approved"
      },
      {
        title: "Discrete Maths Mid-Sem 2023",
        subjectCode: "MA102",
        year: 2023,
        semester: 2,
        resourceType: "Mid-Sem Paper",
        fileUrl: "/uploads/sample.pdf",
        fileSize: 512 * 1024,
        uploader: bot._id,
        status: "approved"
      },
      {
        title: "Intro to Programming Lecture Slides",
        subjectCode: "CS101",
        year: 2024,
        semester: 1,
        resourceType: "Lecture Slides",
        fileUrl: "/uploads/sample.pdf",
        fileSize: 2048 * 1024,
        uploader: bot._id,
        status: "approved"
      }
    ];

    // Clear old test resources from this bot to avoid clutter
    await Resource.deleteMany({ uploader: bot._id });
    
    await Resource.create(testResources);
    console.log("Successfully seeded 3 test resources!");
    console.log("IMPORTANT: Please refresh your browser (hard refresh) on /explorer");

  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.connection.close();
  }
}

seed();
