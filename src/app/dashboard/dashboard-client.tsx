"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Coins, 
  Upload, 
  Search, 
  BookMarked, 
  Sparkles,
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownLeft,
  FileText
} from "lucide-react";
import { Session } from "next-auth";
import { UploadModal } from "@/components/upload-modal";
import Link from "next/link";

interface Activity {
  id: string;
  type: "upload" | "unlock";
  title: string;
  date: string;
  coins: number;
}

interface DashboardClientProps {
  session: Session;
  recentActivity: Activity[];
}

export default function DashboardClient({ session, recentActivity }: DashboardClientProps) {
  const [mounted, setMounted] = useState(false);
  const user = session.user;
  const coins = (user as any).coins || 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const actions = [
    {
      id: "upload",
      icon: Upload,
      title: "Upload Resource",
      desc: "Earn 10 coins per contribution",
      color: "bg-blue-500/10 text-blue-400"
    },
    {
      id: "explorer",
      icon: Search,
      title: "Academic Explorer",
      desc: "Browse by Semester & Subject",
      color: "bg-purple-500/10 text-purple-400"
    },
    {
      id: "library",
      icon: BookMarked,
      title: "My Library",
      desc: "Saved & purchased resources",
      color: "bg-pink-500/10 text-pink-400"
    },
    {
      id: "insights",
      icon: Sparkles,
      title: "Community Insights",
      desc: "Tips, links and wisdom",
      color: "bg-yellow-500/10 text-yellow-500"
    }
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12"
    >
      {/* Welcome Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-3 font-sans">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              {user?.name?.split(" ")[0]}
            </span>
          </h1>
          <p className="text-2xl text-zinc-400 font-normal font-inter">
            You have successfully authenticated with <span className="text-zinc-300">{user?.email}</span>
          </p>
        </div>

        {/* Coin Balance Widget */}
        <div className="p-[1px] rounded-2xl bg-gradient-to-br from-purple-500/50 to-blue-500/50">
          <div className="bg-[#0a0a0a] rounded-[15px] px-8 py-6 flex items-center gap-6">
            <div className="w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Coins className="w-8 h-8 text-yellow-500" />
            </div>
            <div>
              <p className="text-base text-zinc-500 uppercase tracking-widest font-bold mb-1 font-inter">Balance</p>
              <p className="text-4xl font-bold text-white">{coins} AST</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.map((action) => {
          const content = (
            <motion.div
              variants={item}
              whileHover={{ y: -5 }}
              className="p-10 rounded-[2rem] bg-white/[0.02] border border-white/10 backdrop-blur-sm hover:bg-white/[0.05] transition-all cursor-pointer group h-full"
            >
              <div className={`w-16 h-16 rounded-2xl ${action.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-semibold mb-3 font-inter">{action.title}</h3>
              <p className="text-lg text-zinc-500 font-normal font-inter">{action.desc}</p>
            </motion.div>
          );

          if (action.id === "upload") {
            return (
              <UploadModal key={action.id}>
                {content}
              </UploadModal>
            );
          }

          if (action.id === "explorer") {
            return (
              <Link key={action.id} href="/explorer" className="h-full">
                {content}
              </Link>
            );
          }

          if (action.id === "library") {
            return (
              <Link key={action.id} href="/library" className="h-full">
                {content}
              </Link>
            );
          }

          if (action.id === "insights") {
            return (
              <Link key={action.id} href="/insights" className="h-full">
                {content}
              </Link>
            );
          }

          return <div key={action.id} className="h-full">{content}</div>;
        })}
      </div>

      {/* Recent Activity Section */}
      <motion.div variants={item} className="p-12 rounded-[2.5rem] bg-white/[0.01] border border-white/5 font-inter">
        <div className="flex items-center gap-5 mb-12">
          <LayoutDashboard className="w-8 h-8 text-purple-500" />
          <h2 className="text-3xl font-semibold">Recent Activity</h2>
        </div>
        
        {recentActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-zinc-600 border border-dashed border-white/5 rounded-3xl">
            <p className="text-xl">No recent activity found. Start by uploading a paper!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    activity.type === "upload" ? "bg-green-500/10 text-green-400" : "bg-blue-500/10 text-blue-400"
                  }`}>
                    {activity.type === "upload" ? <ArrowUpRight className="w-7 h-7" /> : <ArrowDownLeft className="w-7 h-7" />}
                  </div>
                  <div>
                    <h4 className="text-xl font-medium text-white group-hover:text-purple-400 transition-colors">
                      {activity.type === "upload" ? "Uploaded " : "Unlocked "} 
                      {activity.title}
                    </h4>
                    <p className="text-base text-zinc-500">
                      {mounted ? new Date(activity.date).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      }) : "Loading date..."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-2xl font-bold ${
                    activity.coins > 0 ? "text-green-400" : "text-zinc-400"
                  }`}>
                    {activity.coins > 0 ? "+" : ""}{activity.coins}
                  </span>
                  <Coins className={`w-6 h-6 ${activity.coins > 0 ? "text-yellow-500" : "text-zinc-500"}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
