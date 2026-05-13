"use client";

import { useEffect } from "react";
import { useMotionValue, useSpring, motion, useTransform } from "framer-motion";

export function MouseSpotlight() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <>
      <motion.div
        className="pointer-events-none fixed inset-0 z-30"
        style={{
          background: `radial-gradient(600px circle at ${springX}px ${springY}px, rgba(139, 92, 246, 0.08), transparent 80%)`,
        }}
      />
      <motion.div
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          x: useTransform(springX, (x) => (x - (typeof window !== 'undefined' ? window.innerWidth / 2 : 0)) * 0.05),
          y: useTransform(springY, (y) => (y - (typeof window !== 'undefined' ? window.innerHeight / 2 : 0)) * 0.05),
        }}
      >
        <div className="absolute top-[20%] left-[15%] w-1 h-1 bg-white/20 rounded-full blur-[1px]" />
        <div className="absolute top-[60%] left-[80%] w-2 h-2 bg-purple-500/10 rounded-full blur-[2px]" />
        <div className="absolute top-[80%] left-[30%] w-1.5 h-1.5 bg-blue-500/10 rounded-full blur-[1px]" />
      </motion.div>
    </>
  );
}
