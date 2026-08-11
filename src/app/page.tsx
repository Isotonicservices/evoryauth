"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ParticleBg } from "@/components/particle-bg";
import { Navigation } from "@/components/navigation";
import { GlowCard } from "@/components/glow-card";
import { Shield, Key, Terminal, Zap, CheckCircle2, Lock, Code, Cpu } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen text-slate-100 overflow-hidden pb-20">
      <ParticleBg />
      <Navigation />

      {/* Hero Section */}
      <section className="relative z-10 pt-36 md:pt-48 px-6 max-w-6xl mx-auto text-center flex flex-col items-center">
        {/* Banner Announcement */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/5 text-xs text-red-400 font-semibold mb-6 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
        >
          <Zap className="h-3 w-3" />
          Hyper Auth 2.0: Cyber Security Redefined
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-outfit text-4xl md:text-7xl font-extrabold tracking-tight mb-6"
        >
          Next-Gen Software <br />
          <span className="bg-gradient-to-r from-red-400 via-white to-red-400 bg-clip-text text-transparent">
            Licensing & Protection
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed font-sans"
        >
          Protect your software assets from cracking, manage active user license pools, generate bulk keys, and integrate our lightning-fast SDK in minutes.
        </motion.p>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-20"
        >
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]"
          >
            <Shield className="h-5 w-5" />
            Protect Your First App
          </Link>
          <Link
            href="/docs"
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-lg glass-panel hover:bg-white/5 border border-white/10 text-slate-300 hover:text-white font-semibold transition-all duration-300"
          >
            <Terminal className="h-5 w-5" />
            Developer Docs
          </Link>
        </motion.div>

        {/* Dashboard Teaser Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full relative rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
          <div className="h-11 bg-slate-950/80 border-b border-white/5 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-white/60" />
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="text-xs text-slate-500 font-mono ml-4 select-none">https://portal.Hyper Auth.com/dashboard</div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-md p-6 flex flex-col md:flex-row gap-6 min-h-[350px]">
            {/* Sidebar teaser */}
            <div className="w-full md:w-48 flex flex-col gap-2">
              <div className="h-8 bg-red-500/10 rounded-md border border-red-500/20 flex items-center px-3 gap-2">
                <Cpu className="h-4 w-4 text-red-400" />
                <span className="text-xs text-slate-300 font-semibold">Overview</span>
              </div>
              <div className="h-8 bg-slate-800/30 rounded-md flex items-center px-3 gap-2">
                <Key className="h-4 w-4 text-slate-500" />
                <span className="text-xs text-slate-400">License keys</span>
              </div>
              <div className="h-8 bg-slate-800/30 rounded-md flex items-center px-3 gap-2">
                <Code className="h-4 w-4 text-slate-500" />
                <span className="text-xs text-slate-400">Settings</span>
              </div>
            </div>
            {/* Stats grid teaser */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-28 glass-panel border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-semibold">Active Licenses</span>
                <span className="text-3xl font-extrabold text-white">1,482</span>
              </div>
              <div className="h-28 glass-panel border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-semibold">API Requests</span>
                <span className="text-3xl font-extrabold text-white">341,209</span>
              </div>
              <div className="h-28 glass-panel border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-xs text-slate-400 font-semibold">Security Status</span>
                <span className="text-sm font-semibold px-2 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md w-fit inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Protected
                </span>
              </div>
              {/* Fake Graph */}
              <div className="md:col-span-3 h-32 glass-panel border border-white/5 rounded-xl p-4 flex items-end gap-1.5">
                <div className="h-8 w-full bg-red-500/20 border border-red-500/40 rounded-sm" />
                <div className="h-12 w-full bg-red-500/20 border border-red-500/40 rounded-sm" />
                <div className="h-16 w-full bg-white/20 border border-white/40 rounded-sm" />
                <div className="h-24 w-full bg-red-500/20 border border-red-500/40 rounded-sm" />
                <div className="h-20 w-full bg-red-500/20 border border-red-500/40 rounded-sm" />
                <div className="h-28 w-full bg-red-500/20 border border-red-500/40 rounded-sm animate-pulse" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full text-left">
          <GlowCard glowColor="red">
            <Lock className="h-10 w-10 text-red-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">AES-256-GCM Handshake</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every SDK connection uses dynamic temporary key cryptography to secure communications against local packet sniffers and decompilers.
            </p>
          </GlowCard>
          <GlowCard glowColor="red">
            <Cpu className="h-10 w-10 text-red-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">HWID Lock Verification</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ensure software licenses are locked to specific machines. Automated hardware ID fingerprint parsing blocks simultaneous usage.
            </p>
          </GlowCard>
          <GlowCard glowColor="red">
            <Terminal className="h-10 w-10 text-red-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">Multi-Language SDKs</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Native boilerplate configurations for C++, C#, Python, JavaScript, and Lua enable integration into any client project.
            </p>
          </GlowCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-black/50 backdrop-blur-xl mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center justify-center gap-4">
          <img src="/logo.png" alt="Hyper Team" className="h-10 w-10 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
          <p className="text-slate-500 text-sm font-medium tracking-wide">
            © {new Date().getFullYear()} <span className="text-red-400 font-bold">Hyper Team</span>. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
