"use client";

import React from "react";
import { motion } from "framer-motion";

interface GlowCardProps {
  children: React.ReactNode;
  glowColor?: "blue" | "purple" | "cyan" | "green" | "none";
  className?: string;
  withShimmer?: boolean;
}

export function GlowCard({ children, glowColor = "blue", className = "", withShimmer = false }: GlowCardProps) {
  const shadowMap = {
    blue: "rgba(59, 130, 246, 0.15)",
    purple: "rgba(168, 85, 247, 0.15)",
    cyan: "rgba(6, 182, 212, 0.15)",
    green: "rgba(34, 197, 94, 0.15)",
    none: "transparent",
  };

  const glassClassMap = {
    blue: "glass-blue",
    purple: "glass-purple",
    cyan: "glass-cyan",
    green: "glass-green",
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
            glowColor === "blue"
              ? "from-blue-500 to-indigo-500"
              : glowColor === "purple"
              ? "from-purple-500 to-pink-500"
              : glowColor === "cyan"
              ? "from-cyan-500 to-emerald-500"
              : "from-green-500 to-emerald-500"
          }`}
        />
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
