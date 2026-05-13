"use client";

import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { useEffect, useMemo } from "react";

export function NebulaBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();

  const springConfig = { damping: 50, stiffness: 200 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    
    // Use window.innerWidth/Height to make parallax relative to screen size
    const handleResize = () => {
      mouseX.set(window.innerWidth / 2);
      mouseY.set(window.innerHeight / 2);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [mouseX, mouseY, shouldReduceMotion]);

  // Optimized transforms using percentages for responsiveness
  const orb1X = useTransform(springX, [0, 2000], [-20, 20]);
  const orb1Y = useTransform(springY, [0, 1000], [-20, 20]);
  
  const orb2X = useTransform(springX, [0, 2000], [30, -30]);
  const orb2Y = useTransform(springY, [0, 1000], [30, -30]);

  if (shouldReduceMotion) {
    return <div className="fixed inset-0 bg-[#030303] -z-20" />;
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-20 bg-[#030303] will-change-transform">
      {/* Optimized Static Base Gradients (No Blurs) */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10 opacity-50" />

      {/* Optimized Interactive Orb 1 - Violet */}
      <motion.div
        style={{ x: orb1X, y: orb1Y }}
        className="absolute top-[10%] left-[10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[80px] transform-gpu"
      />

      {/* Optimized Interactive Orb 2 - Electric Blue */}
      <motion.div
        style={{ x: orb2X, y: orb2Y }}
        className="absolute bottom-[10%] right-[10%] w-[700px] h-[700px] rounded-full bg-cyan-500/10 blur-[100px] transform-gpu"
      />

      {/* Static Grid Overlay - Using Opacity instead of Masking for performance */}
      <div 
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(#ffffff10 1px, transparent 1px), linear-gradient(90deg, #ffffff10 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
      
      {/* Simple Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} 
      />
    </div>
  );
}
