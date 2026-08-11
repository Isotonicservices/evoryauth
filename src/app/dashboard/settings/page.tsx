"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { GlowCard } from "@/components/glow-card";
import { Settings, ShieldCheck, KeyRound, User, Lock, Mail, CreditCard, Copy, CheckCircle2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPortal() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);


  const handleCopyKey = () => {
    navigator.clipboard.writeText(`secure_token_dev_${user?.id}_${btoa(user?.username || "")}`);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = () => {
    setRegenerating(true);
    setTimeout(() => setRegenerating(false), 1500);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <div className="bg-mesh" />
      <Sidebar isAdmin={user?.role === "ADMIN" || user?.role === "ADMIN_MINI"} />

      <main className="flex-1 p-8 overflow-y-auto max-w-5xl z-10 animate-fadeIn">
        <div className="mb-10 border-b border-white/5 pb-6">
          <h1 className="text-3xl font-extrabold font-outfit text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-slate-500/10 rounded-xl border border-slate-500/20 text-slate-400 shadow-inner">
              <Settings className="h-6 w-6" />
            </div>
            Portal Settings
          </h1>
          <p className="text-sm text-slate-400 mt-3 max-w-2xl">
            Configure profile identities, active security modules, and developer access credentials.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-blue-400 font-mono text-xs gap-4">
            <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
            Loading configuration matrix...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 stagger-children">
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* Profile Info */}
              <GlowCard glowColor="blue" className="relative overflow-hidden group">
                {/* Decorative background element */}
                <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                
                <h3 className="text-sm font-bold mb-6 flex items-center gap-2 text-white relative z-10">
                  <User className="h-4 w-4 text-blue-400" /> Identity Matrix
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-8 items-start relative z-10">
                  {/* Avatar */}
                  <div className="relative group shrink-0">
                    <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 p-[3px] relative z-10">
                      <div className="h-full w-full rounded-2xl bg-[#0a0a14] flex items-center justify-center text-3xl font-bold text-white uppercase shadow-inner overflow-hidden">
                        {user?.username?.substring(0, 2)}
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-500 rounded-lg border-2 border-[#020106] z-20">
                      <ShieldCheck className="h-4 w-4 text-[#020106]" />
                    </div>
                  </div>
                  
                  {/* Fields */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1.5"><User className="h-3 w-3" /> System Alias</label>
                      <div className="bg-black/40 border border-white/5 px-4 py-3 rounded-xl font-semibold text-white shadow-inner">
                        {user?.username}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1.5"><Mail className="h-3 w-3" /> Communication Uplink</label>
                      <div className="bg-black/40 border border-white/5 px-4 py-3 rounded-xl font-semibold text-slate-300 shadow-inner">
                        {user?.email}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1.5"><CreditCard className="h-3 w-3" /> Licensing Tier</label>
                      <div className="bg-black/40 border border-blue-500/20 px-4 py-3 rounded-xl font-semibold text-blue-400 shadow-inner flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                          {user?.plan} SUBSCRIPTION
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </GlowCard>

              {/* API access tokens */}
              <GlowCard glowColor="cyan" className="relative overflow-hidden">
                <div className="absolute right-0 bottom-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -mr-32 -mb-32 pointer-events-none" />
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                      <KeyRound className="h-4 w-4 text-cyan-400" /> Global API Access Token
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-md">
                      Authenticate external pipelines, CLI tools, or server-to-server infrastructure.
                    </p>
                  </div>
                  <button onClick={handleRegenerateKey} disabled={regenerating} className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg text-xs font-bold border border-cyan-500/30 transition-all">
                    <RefreshCw className={`h-3 w-3 ${regenerating ? "animate-spin" : ""}`} /> Roll Key
                  </button>
                </div>

                <div className="relative group z-10">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="bg-black/80 border border-white/10 p-4 rounded-xl flex items-center gap-4 relative">
                    <code className="font-mono text-sm text-cyan-300 break-all select-all flex-1">
                      {regenerating ? "••••••••••••••••••••••••••••••••••••••••••••••••" : `hyper_api_live_${user?.id}_${btoa(user?.username || "")}`}
                    </code>
                    <button 
                      onClick={handleCopyKey}
                      disabled={regenerating}
                      className="shrink-0 h-10 w-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                    >
                      {copiedKey ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5 text-slate-400" />}
                    </button>
                  </div>
                </div>
              </GlowCard>
            </div>


          </div>
        )}
      </main>
    </div>
  );
}
