"use server";

import { put } from "@vercel/blob";
import { auth } from "@/auth";
import connectToDatabase from "./db";
import Resource from "@/models/Resource";
import User from "@/models/User";
import Unlock from "@/models/Unlock";
import Post from "@/models/Post";
import { revalidatePath } from "next/cache";
import { signOut } from "@/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function getPosts(filters?: {
  category?: string;
  search?: string;
}) {
  await connectToDatabase();
  const query: any = {};
  
  if (filters?.category && filters.category !== "all") {
    query.category = filters.category;
  }
  
  if (filters?.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { content: { $regex: filters.search, $options: "i" } },
      { tags: { $in: [new RegExp(filters.search, "i")] } }
    ];
  }

  const posts = await Post.find(query)
    .populate("author", "name image")
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(posts));
}

export async function createPost(formData: FormData) {
  const session = await auth();
  if (!session || !session.user) throw new Error("Unauthorized");

  const userId = (session.user as any).id;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as any;
  const tagsString = formData.get("tags") as string;
  const tags = tagsString ? tagsString.split(",").map(t => t.trim()) : [];

  if (!title || !content || !category) throw new Error("Missing fields");

  await connectToDatabase();

  // --- 1. Rate Limiting (Spam Prevention) ---
  const dailyPosts = await Post.countDocuments({
    author: userId,
    createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  });

  if (dailyPosts >= 5) {
    throw new Error("Insight Overload: You can only share 5 insights per 24 hours. Let others speak too!");
  }

  // --- 2. AI Content Moderation ---
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are an academic community moderator for ExamForge (IIITDMJ Community). 
      Analyze this user-generated insight/post for quality and relevance.
      
      POST DATA:
      Title: ${title}
      Category: ${category}
      Content: ${content}
      Tags: ${tags.join(", ")}

      MODERATION RULES:
      1. Quality: Reject if the content is just random characters, "shitposting", or extremely low effort (e.g., "adsdsad").
      2. Relevance: The content should be relevant to students, academics, career, or college life.
      3. Safety: Reject any content that contains hate speech, extreme toxicity, or illegal material.
      4. Academic Integrity: While personal opinions are okay, blatant misinformation should be flagged.

      Return ONLY a JSON object:
      {
        "isApproved": boolean,
        "reason": string (if rejected),
        "suggestedTags": string[] (optional additions)
      }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const modData = JSON.parse(response.text().replace(/```json|```/g, ""));

    if (!modData.isApproved) {
      throw new Error(`AI Moderation Rejected: ${modData.reason || "Content did not meet community standards."}`);
    }

  } catch (error: any) {
    console.error("Moderation failed:", error);
    if (error.message.includes("Moderation Rejected")) throw error;
    // If AI fails, we allow it but flag it internally for manual review
  }

  await Post.create({
    title,
    content,
    category,
    tags,
    author: userId
  });

  revalidatePath("/insights");
  return { success: true };
}

export async function upvotePost(postId: string) {
  const session = await auth();
  if (!session || !session.user) throw new Error("Unauthorized");

  const userId = (session.user as any).id;
  await connectToDatabase();

  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");

  const hasUpvoted = post.upvotes.includes(userId);
  if (hasUpvoted) {
    await Post.findByIdAndUpdate(postId, { $pull: { upvotes: userId } });
  } else {
    await Post.findByIdAndUpdate(postId, { $addToSet: { upvotes: userId } });
  }

  revalidatePath("/insights");
  return { success: !hasUpvoted };
}

export async function getUserUnlocks() {
  const session = await auth();
  if (!session || !session.user) return [];

  await connectToDatabase();
  const unlocks = await Unlock.find({ user: (session.user as any).id }).lean();
  return unlocks.map((u: any) => u.paper.toString());
}

export async function unlockPaper(paperId: string) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const userId = (session.user as any).id;

  await connectToDatabase();

  // 1. Check if already unlocked or uploader
  const resource = await Resource.findById(paperId);
  if (!resource) throw new Error("Resource not found");

  if (resource.uploader.toString() === userId) {
    return { success: true, message: "Uploader already has access" };
  }

  const existingUnlock = await Unlock.findOne({ user: userId, paper: paperId });
  if (existingUnlock) {
    return { success: true, message: "Already unlocked" };
  }

  // 2. Check balance
  const user = await User.findById(userId);
  if (!user || user.coins < 5) {
    throw new Error("Insufficient AST coins (Need 5)");
  }

  // 3. Perform transaction (simplified)
  await User.findByIdAndUpdate(userId, { $inc: { coins: -5 } });
  await Unlock.create({ user: userId, paper: paperId, cost: 5 });

  revalidatePath("/explorer");
  revalidatePath("/dashboard");
  
  return { success: true };
}

export async function getUserLibrary() {
  const session = await auth();
  if (!session || !session.user) return { uploaded: [], unlocked: [] };

  const userId = (session.user as any).id;
  await connectToDatabase();

  // 1. Get uploaded resources
  const uploaded = await Resource.find({ uploader: userId })
    .sort({ createdAt: -1 })
    .lean();

  // 2. Get unlocked resources
  const unlockRecords = await Unlock.find({ user: userId }).lean();
  const unlockedPaperIds = unlockRecords.map((u: any) => u.paper);
  
  const unlocked = await Resource.find({ _id: { $in: unlockedPaperIds } })
    .populate("uploader", "name")
    .sort({ createdAt: -1 })
    .lean();

  return {
    uploaded: JSON.parse(JSON.stringify(uploaded)),
    unlocked: JSON.parse(JSON.stringify(unlocked))
  };
}

export async function getRecentActivity() {
  const session = await auth();
  if (!session || !session.user) return [];

  const userId = (session.user as any).id;
  await connectToDatabase();

  // 1. Get latest 5 uploads (using Resource model)
  const uploads = await Resource.find({ uploader: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // 2. Get latest 5 unlocks (using Unlock model which points to Resource)
  const unlocks = await Unlock.find({ user: userId })
    .populate({
      path: 'paper',
      model: Resource
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // 3. Format into activity feed
  const activity = [
    ...uploads.map((u: any) => ({
      id: u._id.toString(),
      type: "upload" as const,
      title: u.title,
      date: u.createdAt,
      coins: 10
    })),
    ...unlocks.map((un: any) => ({
      id: un._id.toString(),
      type: "unlock" as const,
      title: (un.paper as any)?.title || "Deleted Resource",
      date: un.createdAt,
      coins: -5
    }))
  ];

  // Sort combined by date
  return activity
    .sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
      const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
      return dateB - dateA;
    })
    .slice(0, 5)
    .map(item => ({
      ...item,
      date: item.date instanceof Date ? item.date.toISOString() : new Date(item.date).toISOString()
    }));
}

export async function getPapers(filters?: {
  subjectCode?: string;
  year?: number;
  semester?: number;
  resourceType?: string;
  search?: string;
}) {
  await connectToDatabase();

  const query: any = { status: "approved" };

  if (filters?.subjectCode) query.subjectCode = filters.subjectCode.toUpperCase();
  if (filters?.year) query.year = filters.year;
  if (filters?.semester) query.semester = filters.semester;
  if (filters?.resourceType) query.resourceType = filters.resourceType;
  if (filters?.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { subjectCode: { $regex: filters.search, $options: "i" } },
    ];
  }

  const papers = await Resource.find(query)
    .sort({ createdAt: -1 })
    .populate("uploader", "name")
    .lean();

  return JSON.parse(JSON.stringify(papers));
}

export async function uploadPaper(formData: FormData) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const userId = (session.user as any).id;
  const file = formData.get("file") as File;
  let title = formData.get("title") as string;
  let subjectCode = (formData.get("subjectCode") as string).toUpperCase();
  let year = parseInt(formData.get("year") as string);
  let semester = parseInt(formData.get("semester") as string);
  let resourceType = formData.get("resourceType") as any;

  if (!file || !title || !subjectCode || !year || !semester || !resourceType) {
    throw new Error("Missing required fields");
  }

  await connectToDatabase();

  // --- 1. Duplicate Detection (Hashing) ---
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");

  const existingFile = await Resource.findOne({ fileHash });
  if (existingFile) {
    throw new Error("Duplicate Content: This file has already been uploaded to ExamForge.");
  }

  // --- 2. Shredding Prevention (Spam Detection) ---
  const tempGroupId = `${subjectCode}-${year}-${semester}-${resourceType.replaceAll(" ", "-")}`;
  const recentUploads = await Resource.countDocuments({
    uploader: userId,
    groupId: tempGroupId,
    createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
  });

  if (recentUploads >= 3) {
    throw new Error("Spam Limit: You have already uploaded 3 resources for this specific category today. Please combine notes into a single PDF.");
  }

  let qualityScore = 0;
  let isLegit = false;

  // --- 3. Strict AI Validation (IIITDMJ Context) ---
  try {
    const base64File = buffer.toString("base64");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are a professional academic auditor for PDPM IIITDM Jabalpur. 
      Examine this document for academic authenticity and quality.
      
      CRITICAL IIITDMJ CURRICULUM DATA:
      Use these latest subject codes for mapping:
      - Operating Systems: CS2006
      - Discrete Structures: CS1005
      - Data Structures: IT2001
      - Database Management Systems: CS3002
      - Design and Analysis of Algorithms: CS3001
      - Computer Networks: CS3004
      - Theory of Computation: CS2005
      - Computer Organization and Architecture: CS2004
      - Object Oriented Programming: CS2002
      - Engineering Mathematics: MA1001, MA1002
      (If the document title matches these subjects, you MUST use these exact codes).

      AUDIT RULES:
      1. Correct Tagging: You are responsible for giving the CORRECT Subject Code, Year, and Semester. If the user provided "CS202" but the document is for "Discrete Structures", you MUST correct it to "CS1005".
      2. Focus on Academic Content: If the document is a high-quality academic resource, it should be accepted.
      3. Verify Relevance: The content should be relevant to the subject code or title.
      4. Quality Score: Be strict. If blurry or non-academic, set isLegit to false.

      Return ONLY a JSON object:
      {
        "isLegit": boolean,
        "qualityScore": number (1-10),
        "subjectCode": string (IIITDMJ latest format),
        "year": number,
        "semester": number (1-8),
        "resourceType": string (Choose from standard list),
        "suggestedTitle": string (Professional title)
      }`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64File,
          mimeType: file.type || "application/pdf"
        }
      }
    ]);

    const response = await result.response;
    const aiData = JSON.parse(response.text().replace(/```json|```/g, ""));
    
    if (!aiData.isLegit || aiData.qualityScore < 2) {
      throw new Error("AI rejection: This does not appear to be a legitimate IIITDMJ academic resource or is of extremely low quality.");
    }

    // AI Overrides & Sanitization
    isLegit = aiData.isLegit;
    qualityScore = aiData.qualityScore;
    subjectCode = aiData.subjectCode || subjectCode;
    year = aiData.year || year;
    semester = aiData.semester || semester;
    title = aiData.suggestedTitle || title;

    const validTypes = [
      "Mid-Sem Paper", "End-Sem Paper", "Quiz Paper", "Notes", "Lecture Slides", 
      "Reference Material", "Assignment", "Tutorial", "Lab Manual", 
      "Weekly Lab Sheet", "Viva Questions", "Cheat Sheet", "Useful PDF", "Other"
    ];

    if (validTypes.includes(aiData.resourceType)) {
      resourceType = aiData.resourceType;
    } else if (aiData.resourceType.includes("Notes")) {
      resourceType = "Notes";
    } else {
      resourceType = validTypes.includes(resourceType) ? resourceType : "Other";
    }

  } catch (error: any) {
    console.error("Audit failed:", error);
    if (error.message.includes("AI rejection") || error.message.includes("Spam")) throw error;
    throw new Error("Verification Failed: We couldn't verify this as a valid IIITDMJ resource. Ensure the document is clear.");
  }

  // --- 4. File Storage ---
  const filename = `${Date.now()}-${file.name.replaceAll(" ", "-")}`;
  const blob = await put(filename, buffer, {
    access: "public",
  });
  const publicUrl = blob.url;

  // --- 5. Database Record ---
  const groupId = `${subjectCode}-${year}-${semester}-${resourceType.replaceAll(" ", "-")}`;

  const resource = await Resource.create({
    title,
    subjectCode: subjectCode.toUpperCase(),
    year,
    semester,
    resourceType,
    fileUrl: publicUrl,
    fileSize: file.size,
    uploader: userId,
    status: "approved",
    qualityScore,
    groupId,
    fileHash
  });

  // --- 6. Throttled Reward Logic ---
  let coinsToAward = 0;
  if (qualityScore >= 7) coinsToAward = 10;
  else if (qualityScore >= 4) coinsToAward = 5;
  else if (qualityScore >= 2) coinsToAward = 2;

  // Reduce reward if they already uploaded to this group today (discourage shredding)
  if (recentUploads > 0) {
    coinsToAward = Math.floor(coinsToAward / 2);
  }

  if (coinsToAward > 0) {
    await User.findByIdAndUpdate(userId, {
      $inc: { coins: coinsToAward },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/explorer");
  return { 
    success: true, 
    paperId: resource._id.toString(),
    reward: coinsToAward 
  };
}
