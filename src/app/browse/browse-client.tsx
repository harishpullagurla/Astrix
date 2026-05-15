"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  FileText, 
  Download, 
  Calendar, 
  BookOpen, 
  Filter,
  Loader2,
  ExternalLink,
  Lock,
  Unlock as UnlockIcon,
  Coins
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { getPapers, unlockPaper } from "@/lib/actions";
import { toast } from "sonner";

interface Resource {
  _id: string;
  title: string;
  subjectCode: string;
  year: number;
  semester: number;
  resourceType: string;
  fileUrl: string;
  uploader: { _id: string, name: string };
  createdAt: string;
}

interface BrowseClientProps {
  initialPapers: Resource[];
  unlockedPaperIds: string[];
  currentUserId: string;
}

export default function BrowseClient({ 
  initialPapers, 
  unlockedPaperIds, 
  currentUserId 
}: BrowseClientProps) {
  const [papers, setPapers] = useState(initialPapers);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set(unlockedPaperIds));
  const [loading, setLoading] = useState(false);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [semester, setSemester] = useState("all");
  const [resourceType, setResourceType] = useState("all");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleFilter();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, semester, resourceType]);

  async function handleFilter() {
    setLoading(true);
    try {
      const filters: any = {};
      if (search) filters.search = search;
      if (semester !== "all") filters.semester = parseInt(semester);
      if (resourceType !== "all") filters.resourceType = resourceType;
      
      const filteredPapers = await getPapers(filters);
      setPapers(filteredPapers);
    } catch (error) {
      console.error("Failed to filter resources:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlock(paperId: string) {
    setUnlockingId(paperId);
    try {
      const result = await unlockPaper(paperId);
      if (result.success) {
        setUnlockedIds(prev => new Set([...prev, paperId]));
        toast.success("Resource unlocked! 5 Coins deducted.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to unlock resource");
    } finally {
      setUnlockingId(null);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-72 shrink-0 space-y-8">
        <div className="space-y-6 lg:sticky lg:top-24">
          <div>
            <h1 className="text-4xl font-bold tracking-tight font-sans mb-3">
              Browse
            </h1>
            <p className="text-zinc-500 text-lg font-inter">
              Find the resources you need.
            </p>
          </div>

          <div className="space-y-8 pt-8 border-t border-white/5">
            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Semester
              </label>
              <Select value={semester} onValueChange={(val) => setSemester(val || "all")}>
                <SelectTrigger className="w-full bg-white/5 border-white/10 h-12 text-base text-white rounded-xl">
                  <SelectValue placeholder="All Semesters" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  <SelectItem value="all">All Semesters</SelectItem>
                  {[1,2,3,4,5,6,7,8].map(s => (
                    <SelectItem key={s} value={s.toString()}>Sem {s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Category
              </label>
              <Select value={resourceType} onValueChange={(val) => setResourceType(val || "all")}>
                <SelectTrigger className="w-full bg-white/5 border-white/10 h-12 text-base text-white rounded-xl">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Mid-Sem Paper">Mid-Sem Paper</SelectItem>
                  <SelectItem value="End-Sem Paper">End-Sem Paper</SelectItem>
                  <SelectItem value="Notes">Notes</SelectItem>
                  <SelectItem value="Lecture Slides">Lecture Slides</SelectItem>
                  <SelectItem value="Reference Material">Reference Material</SelectItem>
                  <SelectItem value="Lab Manual">Lab Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            {(semester !== "all" || resourceType !== "all" || search !== "") && (
              <Button 
                variant="ghost" 
                size="default" 
                className="w-full text-zinc-500 hover:text-white text-sm h-10"
                onClick={() => {
                  setSemester("all");
                  setResourceType("all");
                  setSearch("");
                }}
              >
                Clear all filters
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-8">
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 group-focus-within:bg-purple-500 group-focus-within:text-white transition-all">
            <Search className="w-5 h-5" />
          </div>
          <Input 
            placeholder="Search by title or subject code (e.g. CS202, Mid-Sem)..." 
            className="pl-16 bg-white/5 border-white/10 text-white h-16 text-xl rounded-2xl focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between px-2">
          <p className="text-lg text-zinc-500">
            Showing <span className="text-white font-medium">{papers.length}</span> resources
          </p>
        </div>

        {/* Results Grid */}
        <div className="relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-3xl">
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            </div>
          )}

          {papers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 text-zinc-500 border border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.01]">
              <FileText className="w-16 h-16 mb-6 opacity-20" />
              <p className="text-2xl font-medium">No resources found</p>
              <p className="text-lg">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
                    {/* Access Status Overlay */}
                    {!unlockedIds.has(paper._id) && paper.uploader._id !== currentUserId && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-3xl z-10 flex flex-col items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                          <Lock className="w-8 h-8 text-white" />
                        </div>
                        <Button
                          disabled={unlockingId === paper._id}
                          onClick={() => handleUnlock(paper._id)}
                          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold h-12 rounded-xl"
                        >
                          {unlockingId === paper._id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <Coins className="w-5 h-5 mr-2" />
                              Unlock for 5 AST
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-6">
                      <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                        {unlockedIds.has(paper._id) || paper.uploader._id === currentUserId ? (
                          <FileText className="w-7 h-7" />
                        ) : (
                          <Lock className="w-7 h-7" />
                        )}
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
                        <span className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">Uploaded by</span>
                        <span className="text-base text-zinc-300">{paper.uploader?.name || "Anonymous"}</span>
                      </div>
                      
                      {(unlockedIds.has(paper._id) || paper.uploader._id === currentUserId) && (
                        <a 
                          href={paper.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl bg-white/5 hover:bg-purple-500/20 text-zinc-400 hover:text-purple-400 transition-all"
                        >
                          <ExternalLink className="w-6 h-6" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
