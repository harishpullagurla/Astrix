"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Folder, 
  FileText, 
  ChevronRight, 
  Home, 
  Lock, 
  ExternalLink, 
  Coins, 
  Loader2,
  Search,
  ArrowLeft,
  Filter,
  BookOpen,
  LayoutGrid,
  FolderTree
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { unlockPaper, getPapers } from "@/lib/actions";
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

interface ExplorerClientProps {
  initialPapers: Resource[];
  unlockedPaperIds: string[];
  currentUserId: string;
}

type TabMode = "search" | "directory";
type ViewMode = "semesters" | "subjects" | "categories" | "files";

export default function ExplorerClient({ 
  initialPapers, 
  unlockedPaperIds, 
  currentUserId 
}: ExplorerClientProps) {
  const [activeTab, setActiveTab] = useState<TabMode>("search");
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set(unlockedPaperIds));
  const [unlockingId, setUnlockingId] = useState<string | null>(null);

  // --- Search Engine State ---
  const [searchPapers, setSearchPapers] = useState(initialPapers);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSemester, setSearchSemester] = useState("all");
  const [searchType, setSearchType] = useState("all");

  // --- Directory State ---
  const [path, setPath] = useState<{ type: ViewMode, value: string | number }[]>([]);
  const [dirSearchQuery, setDirSearchQuery] = useState("");

  // --- Search Engine Logic ---
  useEffect(() => {
    if (activeTab === "search") {
      const delayDebounceFn = setTimeout(() => {
        handleSearchFilter();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, searchSemester, searchType, activeTab]);

  async function handleSearchFilter() {
    setSearchLoading(true);
    try {
      const filters: any = {};
      if (searchQuery) filters.search = searchQuery;
      if (searchSemester !== "all") filters.semester = parseInt(searchSemester);
      if (searchType !== "all") filters.resourceType = searchType;
      
      const filtered = await getPapers(filters);
      setSearchPapers(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setSearchLoading(false);
    }
  }

  // --- Directory Logic ---
  const currentLevel = path.length === 0 ? "semesters" : path[path.length - 1].type;
  const selectedSemester = path.find(p => p.type === "semesters")?.value as number | undefined;
  const selectedSubject = path.find(p => p.type === "subjects")?.value as string | undefined;
  const selectedCategory = path.find(p => p.type === "categories")?.value as string | undefined;

  const filteredDirResources = useMemo(() => {
    let resources = initialPapers;
    if (selectedSemester) resources = resources.filter(r => r.semester === selectedSemester);
    if (selectedSubject) resources = resources.filter(r => r.subjectCode === selectedSubject);
    if (selectedCategory) resources = resources.filter(r => r.resourceType === selectedCategory);
    
    if (dirSearchQuery) {
      const q = dirSearchQuery.toLowerCase();
      resources = resources.filter(r => 
        r.title.toLowerCase().includes(q) || 
        r.subjectCode.toLowerCase().includes(q)
      );
    }
    return resources;
  }, [initialPapers, selectedSemester, selectedSubject, selectedCategory, dirSearchQuery]);

  const dirItems = useMemo(() => {
    if (currentLevel === "semesters") {
      return [1, 2, 3, 4, 5, 6, 7, 8].map(sem => ({
        id: `sem-${sem}`,
        name: `Semester ${sem}`,
        type: "folder" as const,
        nextView: "subjects" as ViewMode,
        value: sem
      }));
    }
    if (currentLevel === "subjects") {
      const subjects = Array.from(new Set(filteredDirResources.map(r => r.subjectCode)));
      return subjects.sort().map(sub => ({
        id: `sub-${sub}`,
        name: sub,
        type: "folder" as const,
        nextView: "categories" as ViewMode,
        value: sub
      }));
    }
    if (currentLevel === "categories") {
      const categories = Array.from(new Set(filteredDirResources.map(r => r.resourceType)));
      return categories.sort().map(cat => ({
        id: `cat-${cat}`,
        name: cat,
        type: "folder" as const,
        nextView: "files" as ViewMode,
        value: cat
      }));
    }
    return filteredDirResources.map(res => ({
      id: res._id,
      name: res.title,
      type: "file" as const,
      resource: res
    }));
  }, [currentLevel, filteredDirResources]);

  // --- Common Actions ---
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
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight font-sans">
            Astrix <span className="text-purple-400">Discovery</span>
          </h1>
          <p className="text-zinc-500 text-lg font-inter">
            Two ways to explore academic intelligence.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-white/5 border border-white/5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("search")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "search" 
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" 
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Search Engine
          </button>
          <button
            onClick={() => setActiveTab("directory")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "directory" 
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" 
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <FolderTree className="w-4 h-4" />
            Directory
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "search" ? (
          <motion.div 
            key="search"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col lg:flex-row gap-8"
          >
            {/* Search Filters Sidebar */}
            <aside className="w-full lg:w-72 shrink-0 space-y-8">
              <div className="space-y-8 lg:sticky lg:top-24">
                <div className="space-y-4">
                  <label className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Semester
                  </label>
                  <Select value={searchSemester} onValueChange={setSearchSemester}>
                    <SelectTrigger className="w-full bg-white/5 border-white/10 h-12 text-white rounded-xl">
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
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="w-full bg-white/5 border-white/10 h-12 text-white rounded-xl">
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

                <Button 
                  variant="ghost" 
                  onClick={() => { setSearchQuery(""); setSearchSemester("all"); setSearchType("all"); }}
                  className="w-full text-zinc-500 hover:text-white"
                >
                  Clear all filters
                </Button>
              </div>
            </aside>

            <div className="flex-1 space-y-8">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input 
                  placeholder="Search by title, subject code..." 
                  className="pl-12 bg-white/5 border-white/10 text-white h-14 text-lg rounded-2xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="relative min-h-[400px]">
                {searchLoading && (
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-3xl">
                    <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                  </div>
                )}

                {searchPapers.length === 0 ? (
                  <div className="py-40 text-center text-zinc-500 border border-dashed border-white/10 rounded-3xl">
                    <p className="text-xl">No resources found matching your filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {searchPapers.map((paper) => (
                      <motion.div
                        key={paper._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-500/30 transition-all flex flex-col"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                            {unlockedIds.has(paper._id) || paper.uploader._id === currentUserId ? (
                              <FileText className="w-6 h-6" />
                            ) : (
                              <Lock className="w-6 h-6" />
                            )}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-white/5 text-zinc-500">
                            {paper.resourceType}
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold mb-2 line-clamp-1 group-hover:text-purple-400 transition-colors">
                          {paper.title}
                        </h3>
                        <p className="text-sm text-zinc-500 mb-6">{paper.subjectCode} • Sem {paper.semester}</p>

                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                          {unlockedIds.has(paper._id) || paper.uploader._id === currentUserId ? (
                            <a 
                              href={paper.fileUrl} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-zinc-400 hover:text-white flex items-center gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View Resource
                            </a>
                          ) : (
                            <Button 
                              size="sm" variant="ghost" className="w-full bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white"
                              onClick={() => handleUnlock(paper._id)}
                            >
                              <Coins className="w-4 h-4 mr-2" />
                              Unlock (5 AST)
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="directory"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-sm text-zinc-500 bg-white/[0.02] border border-white/5 p-3 rounded-xl overflow-x-auto no-scrollbar">
                <button onClick={() => setPath([])} className="flex items-center gap-2 hover:text-purple-400 transition-colors shrink-0">
                  <Home className="w-4 h-4" />
                  <span>Repository</span>
                </button>
                {path.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 shrink-0">
                    <ChevronRight className="w-4 h-4 text-zinc-700" />
                    <button onClick={() => setPath(path.slice(0, i + 1))} className={`hover:text-purple-400 transition-colors ${i === path.length - 1 ? 'text-purple-400 font-medium' : ''}`}>
                      {p.type === "semesters" ? `Sem ${p.value}` : p.value}
                    </button>
                  </div>
                ))}
              </div>

              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input 
                  placeholder="Search in folder..." 
                  className="pl-12 bg-white/5 border-white/10 text-white h-12 rounded-xl"
                  value={dirSearchQuery}
                  onChange={(e) => setDirSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {path.length > 0 && (
                <Button variant="ghost" onClick={() => setPath(prev => prev.slice(0, -1))} className="text-zinc-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dirItems.length === 0 ? (
                <div className="col-span-full py-20 text-center text-zinc-500 border border-dashed border-white/10 rounded-3xl">
                  <p className="text-xl">Folder is empty</p>
                </div>
              ) : (
                dirItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                      item.type === "folder" 
                        ? "bg-white/[0.02] border-white/10 hover:border-purple-500/30 hover:bg-white/[0.04]" 
                        : "bg-white/[0.03] border-white/10 hover:border-blue-500/30"
                    }`}
                    onClick={() => item.type === "folder" && setPath(prev => [...prev, { type: item.nextView!, value: item.value! }])}
                  >
                    {item.type === "folder" ? (
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                          <Folder className="w-8 h-8 fill-current opacity-40" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-zinc-200">{item.name}</h3>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Folder</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                            {unlockedIds.has(item.id) || item.resource!.uploader._id === currentUserId ? (
                              <FileText className="w-6 h-6" />
                            ) : (
                              <Lock className="w-6 h-6" />
                            )}
                          </div>
                          <span className="text-[10px] font-bold px-2 py-1 rounded bg-white/5 text-zinc-500">{item.resource!.year}</span>
                        </div>
                        <h3 className="text-base font-medium mb-4 line-clamp-2">{item.name}</h3>
                        <div className="mt-auto pt-4 border-t border-white/5">
                          {unlockedIds.has(item.id) || item.resource!.uploader._id === currentUserId ? (
                            <a href={item.resource!.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-400 hover:text-blue-400 flex items-center gap-2">
                              <ExternalLink className="w-4 h-4" /> View File
                            </a>
                          ) : (
                            <Button size="sm" variant="ghost" className="w-full bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white" onClick={(e) => { e.stopPropagation(); handleUnlock(item.id); }}>
                              <Coins className="w-4 h-4 mr-2" /> Unlock (5 AST)
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
