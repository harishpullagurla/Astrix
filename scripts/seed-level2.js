const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define temporary schemas to match the app
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

const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String,
  tags: [String],
  author: mongoose.Schema.Types.ObjectId,
  upvotes: [mongoose.Schema.Types.ObjectId],
  reports: { type: Number, default: 0 }
}, { timestamps: true });

const Resource = mongoose.models.Resource || mongoose.model('Resource', ResourceSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Please set MONGODB_URI in .env.local");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB for seeding...");

    // 1. Create/Find Community Bot
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

    // 2. Clear old data from this bot
    await Resource.deleteMany({ uploader: bot._id });
    await Post.deleteMany({ author: bot._id });

    // 3. Create Diverse Resources
    const testResources = [
      {
        title: "CS201 Data Structures End-Sem 2022",
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
        title: "MA102 Discrete Maths Mid-Sem 2023",
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
        title: "CS101 Intro to Programming Slides",
        subjectCode: "CS101",
        year: 2024,
        semester: 1,
        resourceType: "Lecture Slides",
        fileUrl: "/uploads/sample.pdf",
        fileSize: 2048 * 1024,
        uploader: bot._id,
        status: "approved"
      },
      {
        title: "Operating Systems Hand-written Notes",
        subjectCode: "CS302",
        year: 2023,
        semester: 5,
        resourceType: "Notes",
        fileUrl: "/uploads/sample.pdf",
        fileSize: 5 * 1024 * 1024,
        uploader: bot._id,
        status: "approved"
      },
      {
        title: "Database Systems Lab Manual",
        subjectCode: "CS304",
        year: 2023,
        semester: 5,
        resourceType: "Lab Manual",
        fileUrl: "/uploads/sample.pdf",
        fileSize: 1.5 * 1024 * 1024,
        uploader: bot._id,
        status: "approved"
      },
      {
        title: "Compiler Design End-Sem 2021",
        subjectCode: "CS401",
        year: 2021,
        semester: 7,
        resourceType: "End-Sem Paper",
        fileUrl: "/uploads/sample.pdf",
        fileSize: 800 * 1024,
        uploader: bot._id,
        status: "approved"
      },
      {
        title: "Machine Learning Cheat Sheet",
        subjectCode: "CS402",
        year: 2024,
        semester: 8,
        resourceType: "Cheat Sheet",
        fileUrl: "/uploads/sample.pdf",
        fileSize: 300 * 1024,
        uploader: bot._id,
        status: "approved"
      }
    ];

    await Resource.create(testResources);
    console.log(`Successfully seeded ${testResources.length} resources!`);

    // 4. Create Diverse Insights
    const testPosts = [
      {
        title: "Top 5 YouTube Playlists for Data Structures",
        content: "1. Abdul Bari (Legendary)\n2. Striver (A2Z Sheet)\n3. mycodeschool\n4. Jenny's Lectures\n5. Love Babbar",
        category: "Resource",
        tags: ["dsa", "placement", "learning"],
        author: bot._id,
        upvotes: [bot._id]
      },
      {
        title: "How to ace MA102 (Discrete Maths)",
        content: "Focus on Graph Theory and Combinatorics. Rosen is the best book, but for exam, solve last 5 year papers. The questions repeat a lot!",
        category: "Exam Tip",
        tags: ["maths", "ma102", "strategy"],
        author: bot._id,
        upvotes: []
      },
      {
        title: "Professor X's favorite topics for End-Sem",
        content: "He always asks one 10-mark question from Dynamic Programming. Make sure you understand the Knapsack problem thoroughly.",
        category: "Professor Insight",
        tags: ["cs201", "endsem"],
        author: bot._id,
        upvotes: [bot._id]
      },
      {
        title: "GSOC 2026 Preparation Guide",
        content: "Start contributing to open source now. Find projects that interest you on GitHub and look for 'good first issue' labels.",
        category: "Internship Preparation",
        tags: ["gsoc", "internship", "coding"],
        author: bot._id,
        upvotes: [bot._id]
      }
    ];

    await Post.create(testPosts);
    console.log(`Successfully seeded ${testPosts.length} insights!`);

    console.log("IMPORTANT: Verify data at /explorer and /insights");

  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.connection.close();
  }
}

seed();
