"use client";

import Link from "next/link";
import { ShieldCheck, LogIn, Cpu } from "lucide-react";

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="relative flex items-center justify-center">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain relative z-10 transition-transform group-hover:scale-110 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]" />
          <div className="absolute inset-0 bg-red-500/20 blur-md rounded-full group-hover:bg-orange-500/20 transition-all duration-300" />
        </div>
        <span className="font-outfit text-xl font-bold bg-gradient-to-r from-red-400 via-white to-red-400 bg-clip-text text-transparent">
          Hyper Auth
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
        <Link href="/features" className="hover:text-red-400 transition-colors">Features</Link>
        <Link href="/pricing" className="hover:text-red-400 transition-colors">Pricing</Link>
        <Link href="/docs" className="hover:text-red-400 transition-colors">Documentation</Link>
        <Link href="/status" className="hover:text-red-400 transition-colors">Status</Link>
        <Link href="/contact" className="hover:text-red-400 transition-colors">Contact</Link>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 px-4 py-2"
        >
          <LogIn className="h-4 w-4" />
          Portal
        </Link>
        <Link
          href="/register"
          className="relative group overflow-hidden rounded-lg p-[1px] focus:outline-none"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300 group-hover:opacity-90" />
          <div className="relative px-4 py-2 bg-slate-950 rounded-[7px] text-xs font-semibold text-white group-hover:bg-transparent transition-all duration-300 flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5" />
            Get Started
          </div>
        </Link>
      </div>
    </nav>
  );
}
