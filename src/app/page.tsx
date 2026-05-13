"use client";

import { motion } from "framer-motion";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { NebulaBackground } from "@/components/nebula-background";
import { FloatingParticles } from "@/components/floating-particles";
import { AstrixLogo } from "@/components/logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-purple-500/30 overflow-hidden relative">
      <NebulaBackground />
      <FloatingParticles />

      <main className="max-w-7xl mx-auto px-6 min-h-screen flex flex-col items-center justify-center relative z-10">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.8, 
              ease: [0, 0.71, 0.2, 1.01],
              scale: {
                type: "spring",
                damping: 12,
                stiffness: 100,
                restDelta: 0.001
              }
            }}
            className="relative"
          >
            <div className="absolute inset-0 bg-purple-500/20 blur-[40px] rounded-full" />
            <AstrixLogo size={120} className="relative z-10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-purple-400 font-inter"
          >
            Exclusively for IIITDM Jabalpur
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-6xl md:text-8xl font-bold tracking-tight font-sans"
          >

            Master your exams with{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
              Astrix
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl text-lg md:text-xl text-zinc-400 font-normal leading-relaxed font-inter"
          >
            The premium academic intelligence platform for IIITDMJ students. 
            Access past papers, share resources, and earn rewards.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-sm pt-4"
          >
            <GoogleSignInButton />
            <p className="mt-4 text-sm text-zinc-500 font-inter">
              Only @iiitdmj.ac.in emails are permitted.
            </p>
          </motion.div>
        </div>

        {/* Footer - Moved inside main for centering relative to hero */}
        <footer className="absolute bottom-12 text-center text-zinc-600 text-xs tracking-widest uppercase font-medium">
          <p>© {new Date().getFullYear()} Astrix • Built for IIITDMJ</p>
        </footer>
      </main>
    </div>
  );
}
