"use server";

import { auth } from "@/auth";
import { put } from "@vercel/blob";
import connectToDatabase from "./db";
import Paper from "@/models/Paper";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

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
  const examType = formData.get("examType") as any;

  if (!file || !title || !subjectCode || !year || !semester || !examType) {
    throw new Error("Missing required fields");
  }

  await connectToDatabase();

  // 1. Upload file to Vercel Blob
  const blob = await put(file.name, file, {
    access: "public",
  });

  // 2. Create Paper record
  const paper = await Paper.create({
    title,
    subjectCode,
    year,
    semester,
    examType,
    fileUrl: blob.url,
    fileSize: file.size,
    uploader: (session.user as any).id,
    status: "approved",
  });

  // 3. Reward User with 10 coins
  await User.findByIdAndUpdate((session.user as any).id, {
    $inc: { coins: 10 },
  });

  revalidatePath("/dashboard");
  return { success: true, paperId: paper._id.toString() };
}
