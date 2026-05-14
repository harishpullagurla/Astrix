"use server";

import { auth } from "@/auth";
import connectToDatabase from "./db";
import Resource from "@/models/Resource";
import User from "@/models/User";
import Unlock from "@/models/Unlock";
import Post from "@/models/Post";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { signOut } from "@/auth";

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

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as any;
  const tagsString = formData.get("tags") as string;
  const tags = tagsString ? tagsString.split(",").map(t => t.trim()) : [];

  if (!title || !content || !category) throw new Error("Missing fields");

  await connectToDatabase();
  await Post.create({
    title,
    content,
    category,
    tags,
    author: (session.user as any).id
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

  const file = formData.get("file") as File;
  const title = formData.get("title") as string;
  const subjectCode = formData.get("subjectCode") as string;
  const year = parseInt(formData.get("year") as string);
  const semester = parseInt(formData.get("semester") as string);
  const resourceType = formData.get("resourceType") as any;

  if (!file || !title || !subjectCode || !year || !semester || !resourceType) {
    throw new Error("Missing required fields");
  }

  await connectToDatabase();

  // 1. Save file to local public/uploads directory
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create a unique filename to avoid collisions
  const filename = `${Date.now()}-${file.name.replaceAll(" ", "-")}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadDir, filename);

  await fs.writeFile(filePath, buffer);
  const publicUrl = `/uploads/${filename}`;

  // 2. Create Resource record
  const resource = await Resource.create({
    title,
    subjectCode,
    year,
    semester,
    resourceType,
    fileUrl: publicUrl,
    fileSize: file.size,
    uploader: (session.user as any).id,
    status: "approved",
  });

  // 3. Reward User with 10 coins
  await User.findByIdAndUpdate((session.user as any).id, {
    $inc: { coins: 10 },
  });

  revalidatePath("/dashboard");
  revalidatePath("/explorer");
  return { success: true, paperId: resource._id.toString() };
}
