"use client";

import React from "react";
import { motion } from "framer-motion";

interface GlowCardProps {
  children: React.ReactNode;
  glowColor?: "green" | "red" | "none";
  className?: string;
  withShimmer?: boolean;
}

export function GlowCard({ children, glowColor = "green", className = "", withShimmer = false }: GlowCardProps) {
  const shadowMap = {
    green: "rgba(34, 197, 94, 0.15)",
    red: "rgba(239, 68, 68, 0.15)",
    none: "transparent",
  };

  const glassClassMap = {
    green: "glass-green",
    red: "glass-red",
    none: "glass-panel",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02 }}
      className={`${glassClassMap[glowColor]} glass-panel-hover rounded-xl p-6 relative transition-all duration-400 ${
        glowColor !== "none" ? "aurora-border" : ""
      } ${withShimmer ? "shimmer" : ""} ${className}`}
      style={{
        boxShadow: glowColor !== "none" ? `0 8px 32px ${shadowMap[glowColor]}` : undefined,
      }}
    >
      {/* Inner subtle glow */}
      {glowColor !== "none" && (
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none rounded-xl"
          style={{
            background: `radial-gradient(circle at top right, ${shadowMap[glowColor]}, transparent 70%)`
          }}
        />
      )}
      
      {/* Dynamic neon top border accent (legacy support, overridden visually by aurora, but adds base glow) */}
      {glowColor !== "none" && (
        <div
          className={`absolute top-0 left-0 right-0 h-[2px] opacity-70 bg-gradient-to-r ${
            glowColor === "red"
              ? "from-red-500 to-red-600"
              : "from-white to-white"
          }`}
        />
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
