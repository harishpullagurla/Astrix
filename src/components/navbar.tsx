"use client";

import { AstrixLogo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Compass, BookMarked, MessageSquare, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/lib/actions";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <AstrixLogo size={32} />
          <span className="font-bold tracking-tight text-2xl">Astrix</span>
        </Link>

        <div className="hidden md:flex items-center gap-2 bg-white/5 p-1.5 rounded-xl border border-white/5">
          <Link href="/dashboard">
            <Button 
              variant="ghost" 
              size="default" 
              className={`h-10 px-4 gap-2 text-base font-medium ${pathname === "/dashboard" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Button>
          </Link>
          <Link href="/explorer">
            <Button 
              variant="ghost" 
              size="default" 
              className={`h-10 px-4 gap-2 text-base font-medium ${pathname === "/explorer" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
            >
              <Compass className="w-5 h-5" />
              Explorer
            </Button>
          </Link>
          <Link href="/insights">
            <Button 
              variant="ghost" 
              size="default" 
              className={`h-10 px-4 gap-2 text-base font-medium ${pathname === "/insights" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
            >
              <MessageSquare className="w-5 h-5" />
              Insights
            </Button>
          </Link>
          <Link href="/library">
            <Button 
              variant="ghost" 
              size="default" 
              className={`h-10 px-4 gap-2 text-base font-medium ${pathname === "/library" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
            >
              <BookMarked className="w-5 h-5" />
              Library
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/profile">
            <Button
              variant="ghost"
              size="default"
              className={`h-11 w-11 p-0 rounded-full border transition-all ${
                pathname === "/profile" 
                  ? "bg-purple-500/10 border-purple-500/30 text-purple-400" 
                  : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
              }`}
            >
              <UserIcon className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
