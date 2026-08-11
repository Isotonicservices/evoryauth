"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { GlowCard } from "@/components/glow-card";
import { Cpu, Plus, Trash2, KeyRound, Shield, Eye, EyeOff, LayoutGrid } from "lucide-react";

interface Application {
  id: string;
  name: string;
  secret: string;
  version: string;
  status: string;
  hwidLock: boolean;
  encryption: boolean;
}

export default function AppsManager() {
  const [apps, setApps] = useState<Application[]>([]);
  const [newAppName, setNewAppName] = useState("");
  const [loading, setLoading] = useState(true);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});

  const fetchApps = async () => {
    try {
      const res = await fetch("/api/apps");
      const data = await res.json();
      if (data.success) {
        setApps(data.apps);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName) return;

    try {
      const res = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newAppName }),
      });
      const data = await res.json();
      if (data.success) {
        setApps([data.app, ...apps]);
        setNewAppName("");
      } else if (res.status === 403 && data.error === "Subscription Required") {
        alert("Subscription required");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteApp = async (id: string) => {
    if (!confirm("Are you absolutely sure you want to delete this application and all related keys?")) return;
    try {
      const res = await fetch(`/api/apps/${id}`, { method: "DELETE" });
      if (res.ok) {
        setApps(apps.filter((a) => a.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleOption = async (id: string, option: string, value: boolean) => {
    // Optimistic UI update
    setApps(apps.map((a) => (a.id === id ? { ...a, [option]: value } : a)));
    try {
      const res = await fetch(`/api/apps/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [option]: value }),
      });
      if (!res.ok) {
        // Revert on failure
        setApps(apps.map((a) => (a.id === id ? { ...a, [option]: !value } : a)));
      }
    } catch (e) {
      console.error(e);
      setApps(apps.map((a) => (a.id === id ? { ...a, [option]: !value } : a)));
    }
  };

  const handleResetSecret = async (id: string) => {
    if (!confirm("Resetting application secret will break current SDK deployments. Continue?")) return;
    try {
      const res = await fetch(`/api/apps/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetSecret: true }),
      });
      const data = await res.json();
      if (data.success) {
        setApps(apps.map((a) => (a.id === id ? { ...a, secret: data.app.secret } : a)));
        alert("App secret successfully updated!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSecretReveal = (id: string) => {
    setRevealedSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <div className="bg-mesh" />
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto max-w-7xl relative z-10 animate-fadeIn">
        <div className="flex justify-between items-end mb-10 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold font-outfit text-white tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <LayoutGrid className="h-6 w-6" />
              </div>
              Applications Registry
            </h1>
            <p className="text-sm text-slate-400 mt-3 max-w-2xl">
              Configure parameters, security policies, and cryptographic handshakes for your client software components.
            </p>
          </div>
        </div>

        {/* Creation card */}
        <GlowCard glowColor="red" className="mb-10 max-w-2xl">
          <h3 className="text-sm font-bold mb-5 flex items-center gap-2 text-white">
            <Plus className="h-4 w-4 text-red-400" /> Initialize New Protection Node
          </h3>
          <form onSubmit={handleCreateApp} className="flex gap-4">
            <input
              type="text"
              placeholder="e.g. Apex Internal, Fortnite Spoofer"
              value={newAppName}
              onChange={(e) => setNewAppName(e.target.value)}
              className="input-premium flex-1 text-sm font-medium"
            />
            <button
              type="submit"
              disabled={!newAppName}
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
            >
              <Cpu className="h-4 w-4" /> Deploy Engine
            </button>
          </form>
        </GlowCard>

        {/* Applications lists */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-400 font-mono text-xs">
            <div className="h-8 w-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            Querying active nodes...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 stagger-children">
            {apps.map((app, i) => {
              // Alternate glow colors based on index for a premium varied look
              const colors: ("red" | "none")[] = ["red", "none"];
              const cardColor = colors[i % 2];
              
              return (
                <GlowCard key={app.id} glowColor={cardColor} className="flex flex-col group">
                  <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg border bg-${cardColor}-500/10 border-${cardColor}-500/20 text-${cardColor}-400 shadow-[0_0_15px_rgba(var(--${cardColor}-500-rgb),0.2)]`}>
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white tracking-wide">{app.name}</h3>
                        <span className="text-[10px] text-slate-500 font-mono bg-black/30 px-2 py-0.5 rounded border border-white/5 mt-1 inline-block select-all">
                          ID: {app.id}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteApp(app.id)}
                      className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all hover:shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                      title="Delete Application"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 mb-6 space-y-4 shadow-inner relative overflow-hidden">
                    {/* Matrix style secret reveal bg effect */}
                    {revealedSecrets[app.id] && (
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiM0YWRlODAiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9zdmc+')] opacity-50 pointer-events-none" />
                    )}
                    
                    <div className="flex justify-between items-center text-xs relative z-10">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Version Protocol</span>
                      <span className="badge badge-active">{app.version}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs relative z-10 pt-2 border-t border-white/5">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">App Secret</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-semibold transition-colors ${revealedSecrets[app.id] ? "text-emerald-400 text-[11px] select-all bg-emerald-500/10 px-2 py-1 rounded" : "text-slate-400 text-sm tracking-widest"}`}>
                          {revealedSecrets[app.id] ? app.secret : "••••••••••••••••"}
                        </span>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => toggleSecretReveal(app.id)}
                            className={`p-1.5 rounded transition-colors ${revealedSecrets[app.id] ? "text-emerald-400 hover:bg-emerald-500/20" : "text-slate-500 hover:text-white hover:bg-white/10"}`}
                          >
                            {revealedSecrets[app.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => handleResetSecret(app.id)}
                            className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Regenerate Secret"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Configuration Toggles */}
                  <div className="grid grid-cols-2 gap-4 mt-auto">
                    <label className="flex items-center gap-3 cursor-pointer group bg-white/[0.01] hover:bg-white/[0.03] p-3 rounded-xl border border-white/5 transition-colors">
                      <input
                        type="checkbox"
                        checked={app.hwidLock}
                        onChange={(e) => handleToggleOption(app.id, "hwidLock", e.target.checked)}
                        className="toggle-switch"
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-white group-hover:text-red-200 transition-colors">HWID Binding</span>
                        <span className="text-[9px] text-slate-500 font-medium">Lock to single device</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group bg-white/[0.01] hover:bg-white/[0.03] p-3 rounded-xl border border-white/5 transition-colors">
                      <input
                        type="checkbox"
                        checked={app.encryption}
                        onChange={(e) => handleToggleOption(app.id, "encryption", e.target.checked)}
                        className="toggle-switch toggle-switch-purple"
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-white group-hover:text-red-200 transition-colors">AES Handshake</span>
                        <span className="text-[9px] text-slate-500 font-medium">Encrypt all packets</span>
                      </div>
                    </label>
                  </div>
                </GlowCard>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
