"use client";

import { motion } from "framer-motion";
import { 
  Coins, 
  Upload, 
  Search, 
  BookMarked, 
  Sparkles,
  LayoutDashboard
} from "lucide-react";
import { Session } from "next-auth";
import { UploadModal } from "@/components/upload-modal";

interface DashboardClientProps {
  session: Session;
}

export default function DashboardClient({ session }: DashboardClientProps) {
  const user = session.user;
  const coins = (user as any).coins || 0;

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
      title: "Upload PYQ",
      desc: "Earn 10 coins per paper",
      color: "bg-blue-500/10 text-blue-400"
    },
    {
      id: "browse",
      icon: Search,
      title: "Browse Papers",
      desc: "Find what you need",
      color: "bg-purple-500/10 text-purple-400"
    },
    {
      id: "library",
      icon: BookMarked,
      title: "My Library",
      desc: "Saved & purchased papers",
      color: "bg-pink-500/10 text-pink-400"
    },
    {
      id: "insights",
      icon: Sparkles,
      title: "Insights",
      desc: "Coming soon",
      color: "bg-zinc-500/10 text-zinc-400"
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
          <p className="text-xl text-zinc-400 font-normal font-inter">
            You have successfully authenticated with <span className="text-zinc-300">{user?.email}</span>
          </p>
        </div>

        {/* Coin Balance Widget */}
        <div className="p-[1px] rounded-2xl bg-gradient-to-br from-purple-500/50 to-blue-500/50">
          <div className="bg-[#0a0a0a] rounded-[15px] px-8 py-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Coins className="w-7 h-7 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold mb-1 font-inter">Balance</p>
              <p className="text-3xl font-mono font-bold text-white">{coins} AST</p>
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
              className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm hover:bg-white/[0.05] transition-all cursor-pointer group h-full"
            >
              <div className={`w-14 h-14 rounded-xl ${action.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-semibold mb-2 font-inter">{action.title}</h3>
              <p className="text-base text-zinc-500 font-normal font-inter">{action.desc}</p>
            </motion.div>
          );

          if (action.id === "upload") {
            return (
              <UploadModal key={action.id}>
                {/* Wrap content in a div to ensure DialogTrigger asChild works correctly with motion.div */}
                <div className="h-full">{content}</div>
              </UploadModal>
            );
          }

          return <div key={action.id} className="h-full">{content}</div>;
        })}
      </div>

      {/* Placeholder for Recent Activity */}
      <motion.div variants={item} className="p-10 rounded-3xl bg-white/[0.01] border border-white/5 font-inter">
        <div className="flex items-center gap-4 mb-10">
          <LayoutDashboard className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-semibold">Recent Activity</h2>
        </div>
        
        <div className="flex flex-col items-center justify-center py-24 text-zinc-600 border border-dashed border-white/5 rounded-2xl">
          <p className="text-lg">No recent activity found. Start by uploading a paper!</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
