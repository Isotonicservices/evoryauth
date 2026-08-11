"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { GlowCard } from "@/components/glow-card";
import {
  Users,
  ShieldCheck,
  Cpu,
  BarChart3,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  TrendingUp
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { useRouter } from "next/navigation";

interface AppStats {
  appCount: number;
  licensesCount: number;
  activeLicensesCount: number;
  downloadsCount: number;
  recentLogs: Array<{
    id: string;
    action: string;
    message: string;
    createdAt: string;
    ip: string;
  }>;
  chartData: Array<{ name: string; requests: number; licenses: number }>;
}

// Simple animated counter component
const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value.toString(), 10);
    if (start === end) return;

    let totalDuration = 1000;
    let incrementTime = (totalDuration / end) * 2;
    if (incrementTime < 10) incrementTime = 10;

    const timer = setInterval(() => {
      start += Math.ceil(end / 30);
      if (start > end) start = end;
      setDisplayValue(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
};

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<AppStats | null>(null);
  const [apps, setApps] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedApp, setSelectedApp] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!data.authenticated) {
          router.push("/login");
          return;
        }
        setUser(data.user);
        
        const statsRes = await fetch(`/api/dashboard/stats${selectedApp ? `?appId=${selectedApp}` : ""}`);
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
          setApps(statsData.apps);
          if (statsData.activeAppId) {
            setSelectedApp(statsData.activeAppId);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [selectedApp, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.1),transparent_50%)]"></div>
        <div className="relative z- flex flex-col items-center gap-8">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin shadow-[0_0_30px_rgba(239,68,68,0.3)]"></div>
            <div className="absolute inset-0 h-20 w-20 rounded-full border-2 border-red-500/20 animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-xl font-bold font-outfit text-white tracking-wider">HYPER AUTH</h2>
            <p className="text-sm text-slate-400 font-mono">Establishing secure uplink...</p>
          </div>
          <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-600 to-red-400 animate-[loading_2s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>
    );
  }

  // Helper for log styling
  const getLogStyle = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes("login") || a.includes("success") || a.includes("create")) return { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: <CheckCircle2 className="h-3 w-3" /> };
    if (a.includes("fail") || a.includes("ban") || a.includes("delete") || a.includes("error")) return { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: <XCircle className="h-3 w-3" /> };
    return { color: "text-white", bg: "bg-white/10", border: "border-white/30", icon: <Info className="h-3 w-3" /> };
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <div className="bg-mesh" />
      <Sidebar isAdmin={user?.role === "ADMIN" || user?.role === "ADMIN_MINI"} />

      <main className="flex-1 p-8 overflow-y-auto relative z-10 animate-fadeIn">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold font-outfit tracking-tight text-white flex items-center gap-3">
              Dashboard Overview
            </h1>
            <p className="text-sm text-slate-400 mt-1">Monitor real-time analytics and security events.</p>
          </div>

          <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-2 rounded-xl backdrop-blur-md">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider ml-2">Target App:</span>
            <select
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-xs font-semibold focus:outline-none focus:border-red-500 text-white min-w-[200px] shadow-inner transition-all hover:bg-slate-800"
            >
              {apps.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 stagger-children">
          <GlowCard glowColor="red" className="p-5 stat-card stat-red" withShimmer>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Protected Apps</span>
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <Cpu className="h-4 w-4 text-red-400" />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-extrabold text-white"><AnimatedNumber value={stats?.appCount || 0} /></span>
              <span className="text-xs text-red-400 flex items-center gap-1 mb-1 font-semibold"><TrendingUp className="h-3 w-3" /> System Active</span>
            </div>
          </GlowCard>
          
          <GlowCard glowColor="red" className="p-5 stat-card stat-red" withShimmer>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Active Licenses</span>
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <ShieldCheck className="h-4 w-4 text-red-400" />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-extrabold text-white"><AnimatedNumber value={stats?.activeLicensesCount || 0} /></span>
            </div>
          </GlowCard>

          <GlowCard glowColor="red" className="p-5 stat-card stat-red" withShimmer>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Keys Issued</span>
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <Users className="h-4 w-4 text-red-400" />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-extrabold text-white"><AnimatedNumber value={stats?.licensesCount || 0} /></span>
            </div>
          </GlowCard>

          <GlowCard glowColor="red" className="p-5 stat-card stat-red" withShimmer>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">CDN Downloads</span>
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <BarChart3 className="h-4 w-4 text-red-400" />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-extrabold text-white"><AnimatedNumber value={stats?.downloadsCount || 0} /></span>
            </div>
          </GlowCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 stagger-children">
          <GlowCard glowColor="red" className="lg:col-span-2 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                <BarChart3 className="h-4 w-4 text-red-400" /> Live Telemetry Data
              </h3>
              <div className="flex gap-2">
                <span className="flex items-center gap-1.5 text-[10px] text-slate-400"><div className="w-2 h-2 rounded-full bg-red-500"></div> Requests</span>
                <span className="flex items-center gap-1.5 text-[10px] text-slate-400"><div className="w-2 h-2 rounded-full bg-white"></div> Auth Events</span>
              </div>
            </div>
            <div className="flex-1 min-h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReqs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip 
                    contentStyle={{ 
                      background: "rgba(10, 10, 20, 0.8)", 
                      border: "1px solid rgba(255,255,255,0.1)", 
                      borderRadius: "12px",
                      backdropFilter: "blur(12px)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
                    }} 
                    itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                    labelStyle={{ color: "#94a3b8", fontSize: "10px", marginBottom: "4px" }}
                  />
                  <Area type="monotone" dataKey="requests" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorReqs)" activeDot={{ r: 6, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="licenses" stroke="#ffffff" strokeWidth={3} fillOpacity={1} fill="url(#colorLic)" activeDot={{ r: 6, fill: "#ffffff", stroke: "#ef4444", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlowCard>

          <GlowCard glowColor="red" className="flex flex-col h-full">
            <h3 className="text-sm font-bold mb-6 flex items-center gap-2 text-white">
              <Calendar className="h-4 w-4 text-red-400" /> Security Audit Log
            </h3>
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-red-500/50">
              {stats?.recentLogs && stats.recentLogs.length > 0 ? (
                stats.recentLogs.map((log) => {
                  const style = getLogStyle(log.action);
                  return (
                    <div key={log.id} className="relative pl-3 border-l-2 border-white/5 hover:border-red-500/50 transition-colors py-2 group">
                      <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 rounded-r-lg transition-opacity pointer-events-none" />
                      
                      <div className="flex justify-between items-start mb-1 relative z-10">
                        <span className={`font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 ${style.color}`}>
                          {style.icon} {log.action}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono bg-white/5 px-1.5 py-0.5 rounded">{new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className="text-xs text-slate-300 mb-1 relative z-10 leading-relaxed">{log.message}</p>
                      {log.ip && (
                        <span className="text-[9px] text-slate-500 font-mono inline-flex items-center gap-1 relative z-10">
                          IP: {log.ip}
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3 opacity-50">
                  <div className="h-12 w-12 rounded-full border border-dashed border-slate-600 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold tracking-wider uppercase">No Events Logged</span>
                </div>
              )}
            </div>
            <button className="w-full mt-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-red-400 transition-colors border-t border-white/5 pt-4">
              View Complete Audit Trail →
            </button>
          </GlowCard>
        </div>
      </main>
    </div>
  );
}
