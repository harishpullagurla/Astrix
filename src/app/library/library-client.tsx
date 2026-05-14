"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  ExternalLink, 
  BookOpen, 
  Calendar,
  History,
  UploadCloud,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

interface Resource {
  _id: string;
  title: string;
  subjectCode: string;
  year: number;
  semester: number;
  resourceType: string;
  fileUrl: string;
  uploader?: { name: string };
  createdAt: string;
}

interface LibraryClientProps {
  libraryData: {
    uploaded: Resource[];
    unlocked: Resource[];
  };
}

export default function LibraryClient({ libraryData }: LibraryClientProps) {
  const [activeTab, setActiveTab] = useState<"unlocked" | "uploaded">("unlocked");

  const papers = activeTab === "unlocked" ? libraryData.unlocked : libraryData.uploaded;

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-sans">
          My <span className="text-purple-400">Library</span>
        </h1>
        <p className="text-zinc-400 text-lg font-inter">
          Your personal collection of academic intelligence.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("unlocked")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-base font-medium transition-all ${
            activeTab === "unlocked" 
              ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" 
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <History className="w-5 h-5" />
          Unlocked Resources
        </button>
        <button
          onClick={() => setActiveTab("uploaded")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-base font-medium transition-all ${
            activeTab === "uploaded" 
              ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" 
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <UploadCloud className="w-5 h-5" />
          My Contributions
        </button>
      </div>

      {/* Results Grid */}
      <div className="relative min-h-[400px]">
        {papers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-zinc-500 border border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.01]">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              {activeTab === "unlocked" ? <History className="w-10 h-10 opacity-20" /> : <UploadCloud className="w-10 h-10 opacity-20" />}
            </div>
            <p className="text-2xl font-medium mb-2">No resources found</p>
            <p className="text-lg mb-8 text-center max-w-md">
              {activeTab === "unlocked" 
                ? "You haven't unlocked any resources yet. Start exploring the repository!" 
                : "You haven't contributed any resources yet. Share your materials to earn coins!"}
            </p>
            <Link href={activeTab === "unlocked" ? "/explorer" : "/dashboard"}>
              <button className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all group">
                {activeTab === "unlocked" ? "Go to Explorer" : "Go to Dashboard"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {papers.map((paper, index) => (
                <motion.div
                  key={paper._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-purple-500/30 hover:bg-white/[0.04] transition-all flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1.5 rounded-lg bg-white/5 text-xs font-bold uppercase tracking-wider text-zinc-500 border border-white/5">
                        {paper.resourceType}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold mb-3 line-clamp-1 group-hover:text-purple-400 transition-colors">
                    {paper.title}
                  </h3>
                  
                  <div className="space-y-4 mb-8 flex-grow">
                    <div className="flex items-center gap-3 text-base text-zinc-400">
                      <BookOpen className="w-5 h-5" />
                      <span>{paper.subjectCode} • Sem {paper.semester}</span>
                    </div>
                    <div className="flex items-center gap-3 text-base text-zinc-400">
                      <Calendar className="w-5 h-5" />
                      <span>Year {paper.year}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">
                        {activeTab === "unlocked" ? "Uploaded by" : "Status"}
                      </span>
                      <span className="text-base text-zinc-300">
                        {activeTab === "unlocked" ? (paper.uploader?.name || "Anonymous") : "Live"}
                      </span>
                    </div>
                    
                    <a 
                      href={paper.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-white/5 hover:bg-purple-500/20 text-zinc-400 hover:text-purple-400 transition-all"
                    >
                      <ExternalLink className="w-6 h-6" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
