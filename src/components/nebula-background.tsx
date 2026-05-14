"use client";

import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { useEffect } from "react";

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
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, shouldReduceMotion]);

  // Subtle parallax
  const orb1X = useTransform(springX, [0, 2000], [-30, 30]);
  const orb1Y = useTransform(springY, [0, 1000], [-30, 30]);
  
  const orb2X = useTransform(springX, [0, 2000], [40, -40]);
  const orb2Y = useTransform(springY, [0, 1000], [40, -40]);

  if (shouldReduceMotion) {
    return <div className="fixed inset-0 bg-[#030303] -z-20" />;
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-20 bg-[#030303]">
      {/* Dynamic Orbs using Radial Gradients (Faster than CSS Blur) */}
      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] rounded-full opacity-10 transform-gpu"
        style={{
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)",
          x: orb1X,
          y: orb1Y,
        }}
      />

      <motion.div
        className="absolute bottom-[-20%] right-[-10%] w-[1200px] h-[1200px] rounded-full opacity-10 transform-gpu"
        style={{
          background: "radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, transparent 70%)",
          x: orb2X,
          y: orb2Y,
        }}
      />

      {/* Static Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#ffffff10 1px, transparent 1px), linear-gradient(90deg, #ffffff10 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
