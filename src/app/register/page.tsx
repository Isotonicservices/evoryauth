"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlowCard } from "@/components/glow-card";
import { ParticleBg } from "@/components/particle-bg";
import { ShieldCheck, Mail, Lock, User, UserPlus, ArrowRight } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess("Registration successful! Redirecting...");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        setError(data.error || "Registration validation failed.");
      }
    } catch (err) {
      setError("Unable to connect to auth server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-6 bg-[#020106]">
      <ParticleBg />

      <GlowCard glowColor="red" className="w-full max-w-md p-8 z-10 relative">
        <div className="flex flex-col items-center mb-8">
          <ShieldCheck className="h-10 w-10 text-red-500 mb-2" />
          <h2 className="text-xl font-bold font-outfit">Join Hyper Auth Ecosystem</h2>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-semibold">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-bold">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-900/60 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-xs focus:outline-none focus:border-red-500 text-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-bold">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-900/60 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-xs focus:outline-none focus:border-red-500 text-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-bold">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-900/60 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-xs focus:outline-none focus:border-red-500 text-white"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="toggle-switch"
            />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Remember Session</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 rounded-lg text-xs transition-all duration-300 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          >
            {loading ? "Registering account..." : "Create Account"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400">
          Already registered?{" "}
          <Link href="/login" className="text-red-400 hover:underline">
            Login session
          </Link>
        </div>
      </GlowCard>
    </main>
  );
}
