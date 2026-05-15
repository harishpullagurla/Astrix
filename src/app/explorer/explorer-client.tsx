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
  FolderTree,
  CheckCircle2
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
  qualityScore: number;
  groupId: string;
}

interface ExplorerClientProps {
  initialPapers: Resource[];
  unlockedPaperIds: string[];
  currentUserId: string;
  initialCoins: number;
}

type TabMode = "search" | "directory";
type ViewMode = "semesters" | "subjects" | "categories" | "subcategories" | "files";

const MAIN_CATEGORIES = {
  "PYQs": ["Mid-Sem Paper", "End-Sem Paper", "Quiz Paper"],
  "Lecture Slides": ["Lecture Slides"],
  "Notes": ["Notes", "Cheat Sheet"],
  "Labs": ["Lab Manual", "Weekly Lab Sheet", "Viva Questions"],
  "Materials": ["Reference Material", "Assignment", "Tutorial", "Useful PDF", "Other"]
};

export default function ExplorerClient({ 
  initialPapers, 
  unlockedPaperIds, 
  currentUserId,
  initialCoins
}: ExplorerClientProps) {
  const [activeTab, setActiveTab] = useState<TabMode>("search");
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set(unlockedPaperIds));
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [userCoins, setUserCoins] = useState(initialCoins);

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
  const LEVELS: ViewMode[] = ["semesters", "subjects", "categories", "subcategories", "files"];
  const currentLevel = LEVELS[path.length] || "files";

  const selectedSemester = path.find(p => p.type === "semesters")?.value as number | undefined;
  const selectedSubject = path.find(p => p.type === "subjects")?.value as string | undefined;
  const selectedMainCategory = path.find(p => p.type === "categories")?.value as string | undefined;
  const selectedSubCategory = path.find(p => p.type === "subcategories")?.value as string | undefined;

  const filteredDirResources = useMemo(() => {
    let resources = initialPapers;
    if (selectedSemester) resources = resources.filter(r => r.semester === selectedSemester);
    if (selectedSubject) resources = resources.filter(r => r.subjectCode === selectedSubject);
    
    if (selectedMainCategory) {
      const allowedTypes = (MAIN_CATEGORIES as any)[selectedMainCategory] || [];
      resources = resources.filter(r => allowedTypes.includes(r.resourceType));
    }

    if (selectedSubCategory) {
      resources = resources.filter(r => {
        const subVal = `${r.resourceType}-${r.year}`;
        return subVal === selectedSubCategory;
      });
    }
    
    if (dirSearchQuery) {
      const q = dirSearchQuery.toLowerCase();
      resources = resources.filter(r => 
        r.title.toLowerCase().includes(q) || 
        r.subjectCode.toLowerCase().includes(q)
      );
    }
    return resources;
  }, [initialPapers, selectedSemester, selectedSubject, selectedMainCategory, selectedSubCategory, dirSearchQuery]);

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
      return Object.keys(MAIN_CATEGORIES).map(cat => ({
        id: `cat-${cat}`,
        name: cat,
        type: "folder" as const,
        nextView: "subcategories" as ViewMode,
        value: cat
      }));
    }

    if (currentLevel === "subcategories") {
      const subCats = Array.from(new Set(filteredDirResources.map(r => `${r.resourceType}-${r.year}`)));
      return subCats.sort().map(sc => ({
        id: `sc-${sc}`,
        name: sc.replace("-", " "),
        type: "folder" as const,
        nextView: "files" as ViewMode,
        value: sc
      }));
    }

    return [];
  }, [currentLevel, filteredDirResources]);

  const sortedFiles = useMemo(() => {
    if (currentLevel !== "files") return [];
    return [...filteredDirResources].sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
  }, [currentLevel, filteredDirResources]);

  const primaryResource = sortedFiles[0];
  const alternativeResources = sortedFiles.slice(1);

  // --- Common Actions ---
  async function handleUnlock(paperId: string) {
    setUnlockingId(paperId);
    try {
      const result = await unlockPaper(paperId);
      if (result.success) {
        setUnlockedIds(prev => new Set([...prev, paperId]));
        setUserCoins(prev => prev - 5);
        toast.success("Resource unlocked! 5 Coins deducted.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to unlock resource");
    } finally {
      setUnlockingId(null);
    }
  }

  const ResourceCard = ({ res, isPrimary = false }: { res: Resource, isPrimary?: boolean }) => {
    const isUnlocked = unlockedIds.has(res._id) || res.uploader._id === currentUserId;
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-6 rounded-3xl border transition-all ${
          isPrimary 
            ? "bg-purple-500/5 border-purple-500/30 ring-1 ring-purple-500/10" 
            : "bg-white/[0.02] border-white/10"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-2xl ${isPrimary ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/10 text-blue-400"}`}>
            {isUnlocked ? (
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            ) : (
              <Lock className="w-6 h-6" />
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold px-2 py-1 rounded bg-white/5 text-zinc-500 border border-white/5">{res.year}</span>
            {isPrimary && (
              <span className="text-[8px] font-bold uppercase tracking-tighter bg-purple-600 text-white px-2 py-0.5 rounded-full shadow-lg shadow-purple-500/20">
                Verified Primary
              </span>
            )}
          </div>
        </div>
        <h3 className={`text-lg font-semibold mb-4 line-clamp-2 ${isPrimary ? "text-white" : "text-zinc-200"}`}>
          {res.title}
        </h3>
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          {isUnlocked ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Unlocked</span>
              <a 
                href={res.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> View File
              </a>
            </div>
          ) : (
            <Button 
              size="sm" 
              variant="ghost" 
              disabled={unlockingId === res._id}
              className={`w-full h-10 font-bold text-xs rounded-xl ${isPrimary ? "bg-purple-600 text-white hover:bg-purple-500" : "bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white"}`} 
              onClick={(e) => { e.stopPropagation(); handleUnlock(res._id); }}
            >
              {unlockingId === res._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Coins className="w-4 h-4 mr-2" /> Unlock (5 AST)</>}
            </Button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight font-sans">
            Academic <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">Discovery</span>
          </h1>
          <p className="text-zinc-500 text-xl font-normal font-inter max-w-2xl">
            Navigate through structured virtual folders or use our smart search engine.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Coin Balance Widget */}
          <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 group hover:border-yellow-500/30 transition-all">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Coins className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Balance</p>
              <p className="text-xl font-black text-white">{userCoins} AST</p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 p-1.5 bg-white/[0.03] border border-white/5 rounded-[1.25rem] w-fit shadow-2xl backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("search")}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === "search" 
                  ? "bg-purple-600 text-white shadow-xl shadow-purple-500/25" 
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Search Engine
            </button>
            <button
              onClick={() => setActiveTab("directory")}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === "directory" 
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-500/25" 
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <FolderTree className="w-4 h-4" />
              Directory
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {activeTab === "search" ? (
          <motion.div 
            key="search-engine"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col lg:flex-row gap-8"
          >
            <aside className="w-full lg:w-72 shrink-0">
              <div className="space-y-8 lg:sticky lg:top-24 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                    <BookOpen className="w-3 h-3" /> Semester
                  </label>
                  <Select value={searchSemester} onValueChange={setSearchSemester}>
                    <SelectTrigger className="w-full bg-white/5 border-white/10 h-12 text-white rounded-xl">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      <SelectItem value="all">All Semesters</SelectItem>
                      {[1,2,3,4,5,6,7,8].map(s => <SelectItem key={s} value={s.toString()}>Sem {s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                    <Filter className="w-3 h-3" /> Category
                  </label>
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="w-full bg-white/5 border-white/10 h-12 text-white rounded-xl">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      <SelectItem value="all">All Categories</SelectItem>
                      {Object.values(MAIN_CATEGORIES).flat().map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  variant="ghost" 
                  onClick={() => { setSearchQuery(""); setSearchSemester("all"); setSearchType("all"); }}
                  className="w-full text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest"
                >
                  Reset Filters
                </Button>
              </div>
            </aside>

            <div className="flex-1 space-y-8">
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                <Input 
                  placeholder="What are you looking for today?" 
                  className="pl-16 bg-white/[0.03] border-white/10 text-white h-16 text-xl rounded-3xl focus:ring-purple-500/20 shadow-2xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="relative min-h-[400px]">
                {searchLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 opacity-40 transition-opacity">
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse border border-white/5" />
                    ))}
                  </div>
                ) : searchPapers.length === 0 ? (
                  <div className="py-40 text-center text-zinc-600 border border-dashed border-white/5 rounded-[2.5rem]">
                    <p className="text-xl">No resources found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {searchPapers.map((paper) => <ResourceCard key={paper._id} res={paper} />)}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="directory-engine"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-10"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-2 text-sm text-zinc-500 bg-white/[0.02] border border-white/5 p-3 rounded-2xl overflow-x-auto no-scrollbar shadow-inner">
                <button onClick={() => setPath([])} className="flex items-center gap-2 hover:text-blue-400 transition-colors shrink-0 px-2">
                  <Home className="w-4 h-4" />
                  <span className="font-bold uppercase tracking-widest text-[10px]">Root</span>
                </button>
                {path.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 shrink-0">
                    <ChevronRight className="w-4 h-4 text-zinc-800" />
                    <button onClick={() => setPath(path.slice(0, i + 1))} className={`hover:text-blue-400 transition-colors font-bold uppercase tracking-widest text-[10px] px-2 ${i === path.length - 1 ? 'text-blue-400' : ''}`}>
                      {p.type === "semesters" ? `Sem ${p.value}` : p.value}
                    </button>
                  </div>
                ))}
              </div>

              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input 
                  placeholder="Filter this folder..." 
                  className="pl-12 bg-white/5 border-white/10 text-white h-12 rounded-2xl"
                  value={dirSearchQuery}
                  onChange={(e) => setDirSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {path.length > 0 && (
                <Button variant="ghost" onClick={() => setPath(prev => prev.slice(0, -1))} className="text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              )}
            </div>

            {currentLevel !== "files" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {dirItems.length === 0 ? (
                  <div className="col-span-full py-32 text-center text-zinc-600 border border-dashed border-white/5 rounded-[2.5rem]">
                    <Folder className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-lg">This directory is currently empty</p>
                  </div>
                ) : (
                  dirItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="p-8 rounded-[2rem] border bg-white/[0.02] border-white/5 hover:border-blue-500/30 hover:bg-white/[0.04] transition-all cursor-pointer group shadow-2xl"
                      onClick={() => setPath(prev => [...prev, { type: currentLevel, value: item.value! }])}
                    >
                      <div className="flex flex-col items-center text-center space-y-6">
                        <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform shadow-inner">
                          <Folder className="w-10 h-10 fill-current opacity-40" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-zinc-200 group-hover:text-white transition-colors">{item.name}</h3>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-16 py-8">
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500/60 whitespace-nowrap">Verified Primary</h2>
                    <div className="h-px w-full bg-gradient-to-r from-purple-500/20 to-transparent" />
                  </div>
                  {primaryResource ? (
                    <div className="max-w-xl mx-auto">
                      <ResourceCard res={primaryResource} isPrimary={true} />
                    </div>
                  ) : (
                    <p className="text-center text-zinc-600 italic">No resources found</p>
                  )}
                </div>

                {alternativeResources.length > 0 && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-6">
                      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 whitespace-nowrap">Community Alternatives</h2>
                      <div className="h-px w-full bg-gradient-to-r from-white/5 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {alternativeResources.map((res) => <ResourceCard key={res._id} res={res} />)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
