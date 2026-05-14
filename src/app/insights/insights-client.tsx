"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  ThumbsUp, 
  Flag, 
  Plus, 
  Search, 
  Tag,
  Filter,
  Loader2,
  Calendar,
  User as UserIcon,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { createPost, upvotePost, getPosts } from "@/lib/actions";
import { toast } from "sonner";

interface Post {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: { _id: string, name: string, image: string };
  upvotes: string[];
  createdAt: string;
}

interface InsightsClientProps {
  initialPosts: Post[];
  currentUserId: string;
}

export default function InsightsClient({ initialPosts, currentUserId }: InsightsClientProps) {
  const [mounted, setMounted] = useState(false);
  const [posts, setPosts] = useState(initialPosts);
  const [isPosting, setIsPosting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    setMounted(true);
  }, []);
  async function handleCreatePost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPosting(true);
    try {
      const formData = new FormData(event.currentTarget);
      const result = await createPost(formData);
      if (result.success) {
        toast.success("Post shared successfully!");
        setIsDialogOpen(false);
        // Refresh posts
        const updatedPosts = await getPosts({ category, search });
        setPosts(updatedPosts);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create post");
    } finally {
      setIsPosting(false);
    }
  }

  async function handleUpvote(postId: string) {
    try {
      const wasUpvoted = await upvotePost(postId);
      // Optimistic update
      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          const upvotes = p.upvotes.includes(currentUserId)
            ? p.upvotes.filter(id => id !== currentUserId)
            : [...p.upvotes, currentUserId];
          return { ...p, upvotes };
        }
        return p;
      }));
    } catch (error: any) {
      toast.error(error.message || "Failed to upvote");
    }
  }

  async function handleFilter(cat: string) {
    setCategory(cat);
    setLoading(true);
    try {
      const filtered = await getPosts({ category: cat, search });
      setPosts(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    setLoading(true);
    try {
      const filtered = await getPosts({ category, search });
      setPosts(filtered);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-72 shrink-0 space-y-8">
        <div className="space-y-6 lg:sticky lg:top-24">
          <div>
            <h1 className="text-4xl font-bold tracking-tight font-sans mb-3">
              Insights
            </h1>
            <p className="text-zinc-500 text-lg font-inter">
              Community wisdom and tips.
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger 
              nativeButton={true}
              render={
                <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold h-12 rounded-xl gap-2">
                  <Plus className="w-5 h-5" />
                  Share Insight
                </Button>
              }
            />
            <DialogContent className="bg-[#0a0a0a] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Share an Insight</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePost} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Input name="title" placeholder="Catchy title..." required className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Select name="category" defaultValue="General Advice">
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      <SelectItem value="Resource">Resource</SelectItem>
                      <SelectItem value="Exam Tip">Exam Tip</SelectItem>
                      <SelectItem value="Professor Insight">Professor Insight</SelectItem>
                      <SelectItem value="Skill Development">Skill Development</SelectItem>
                      <SelectItem value="Internship Preparation">Internship Preparation</SelectItem>
                      <SelectItem value="General Advice">General Advice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <textarea 
                    name="content" 
                    placeholder="Share your thoughts, tips or useful links..." 
                    required 
                    className="w-full min-h-[150px] bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Input name="tags" placeholder="Tags (comma separated)... e.g. midsem, coding" className="bg-white/5 border-white/10" />
                </div>
                <Button type="submit" disabled={isPosting} className="w-full bg-purple-600">
                  {isPosting ? <Loader2 className="animate-spin" /> : "Post Now"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <div className="space-y-6 pt-8 border-t border-white/5">
            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Category
              </label>
              <div className="space-y-2">
                {[
                  "all",
                  "Resource",
                  "Exam Tip",
                  "Professor Insight",
                  "Skill Development",
                  "Internship Preparation",
                  "General Advice"
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleFilter(cat)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                      category === cat 
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                        : "text-zinc-500 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <Input 
            placeholder="Search posts by title, content or tags..." 
            className="pl-12 bg-white/5 border-white/10 text-white h-14 text-lg rounded-2xl focus:ring-purple-500/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        <div className="relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-3xl">
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            </div>
          )}

          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {posts.map((post, index) => (
                <motion.div
                  key={post._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-500/30 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center overflow-hidden border border-white/5">
                        {post.author.image ? (
                          <img src={post.author.image} alt={post.author.name} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-purple-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-200">{post.author.name}</p>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <Calendar className="w-3 h-3" />
                          <span>{mounted ? new Date(post.createdAt).toLocaleDateString() : "Loading date..."}</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-purple-500/10 text-[10px] font-bold uppercase tracking-wider text-purple-400 border border-purple-500/20">
                      {post.category}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">{post.title}</h3>
                    <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded-md">
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => handleUpvote(post._id)}
                        className={`flex items-center gap-2 transition-colors ${
                          post.upvotes.includes(currentUserId) ? "text-purple-400" : "text-zinc-500 hover:text-white"
                        }`}
                      >
                        <ThumbsUp className={`w-5 h-5 ${post.upvotes.includes(currentUserId) ? "fill-current" : ""}`} />
                        <span className="font-medium">{post.upvotes.length}</span>
                      </button>
                      <button className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
                        <MessageSquare className="w-5 h-5" />
                        <span className="font-medium">0</span>
                      </button>
                    </div>
                    <button className="text-zinc-600 hover:text-red-400 transition-colors">
                      <Flag className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
