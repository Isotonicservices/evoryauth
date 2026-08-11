"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { GlowCard } from "@/components/glow-card";
import {
  Key, Plus, Trash2, Ban, Copy, Check, RefreshCw,
  ChevronDown, Shield, Clock, Fingerprint, X, AlertTriangle,
  Tag, HelpCircle, Wand2, Users, Eye, Sparkles
} from "lucide-react";
import Link from "next/link";

interface License {
  id: string;
  key: string;
  label: string | null;
  duration: string;
  expiresAt: string | null;
  hwid: string | null;
  hwidLock: boolean;
  status: string;
  activations: number;
  activationLimit: number;
}

// ─── HWID Reset Modal ───────────────────────────────────────────────────────
function HwidResetModal({ lic, onConfirm, onCancel }: {
  lic: License;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="bg-[#0a0a14] border border-red-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_0_50px_rgba(239,68,68,0.15)] relative overflow-hidden animate-slideUp">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-red-400" />
        
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <Fingerprint className="h-6 w-6 text-red-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white font-outfit">Reset Hardware ID</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Security Binding Override</p>
          </div>
          <button onClick={onCancel} className="ml-auto text-slate-500 hover:text-white p-2 bg-white/5 rounded-lg transition-colors"><X className="h-4 w-4" /></button>
        </div>
        
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-6">
          <span className="text-[10px] text-red-500/70 font-bold uppercase tracking-widest block mb-2">Target License Key</span>
          <p className="font-mono text-sm text-red-300 break-all font-bold">{lic.key}</p>
        </div>
        
        <p className="text-xs text-slate-400 mb-8 leading-relaxed">
          This action will unlink the current machine identifier from this license. 
          <span className="text-white font-semibold"> The next device to authenticate will become the new permanently bound machine.</span>
        </p>
        
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all">Cancel Override</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4" /> Execute Reset
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── New Keys Banner ────────────────────────────────────────────────────────
function NewKeysBanner({ newKeys, onDismiss }: { newKeys: License[]; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false);
  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(newKeys.map(k => k.key).join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };
  return (
    <div className="mb-8 bg-red-500/10 border border-red-500/30 rounded-2xl p-6 relative overflow-hidden animate-slideUp shadow-[0_0_30px_rgba(239,68,68,0.15)]">
      <div className="absolute top-0 right-0 p-32 bg-red-500/20 blur-[100px] rounded-full pointer-events-none" />
      
      <button onClick={onDismiss} className="absolute top-4 right-4 text-red-500/50 hover:text-red-300 bg-red-500/10 p-1.5 rounded-lg transition-colors z-10"><X className="h-4 w-4" /></button>
      
      <div className="flex items-center gap-3 mb-5 relative z-10">
        <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30">
          <Sparkles className="h-5 w-5 text-red-400" />
        </div>
        <div>
          <span className="text-sm font-bold text-red-400 block font-outfit">Generation Successful</span>
          <span className="text-[10px] text-red-500/70 font-bold uppercase tracking-widest">{newKeys.length} New Key{newKeys.length > 1 ? "s" : ""} Minted</span>
        </div>
      </div>
      
      <div className="space-y-2 mb-5 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-red-500/30 relative z-10">
        {newKeys.map(k => (
          <div key={k.id} className="flex justify-between items-center bg-black/40 border border-red-500/20 px-4 py-2.5 rounded-xl">
            <span className="font-mono text-xs font-bold text-red-300 tracking-wider select-all">{k.key}</span>
            {k.label && <span className="text-[9px] font-bold uppercase tracking-widest text-red-500/60 bg-red-500/10 px-2 py-1 rounded">{k.label}</span>}
          </div>
        ))}
      </div>
      
      <button onClick={handleCopyAll} className={`relative z-10 w-full flex justify-center items-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${copied ? "bg-red-500/30 border border-red-400/50 text-red-200" : "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]"}`}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied to Clipboard!" : `Copy All ${newKeys.length} Keys to Clipboard`}
      </button>
    </div>
  );
}

export default function LicensesManager() {
  const [apps, setApps] = useState<{ id: string; name: string }[]>([]);
  const [selectedApp, setSelectedApp] = useState("");
  const [files, setFiles] = useState<{ id: string; name: string }[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [duration, setDuration] = useState("30d");
  const [amount, setAmount] = useState(1);
  const [keyPattern, setKeyPattern] = useState("");
  const [label, setLabel] = useState("");
  const [showPatternHelp, setShowPatternHelp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newlyGenerated, setNewlyGenerated] = useState<License[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hwidModal, setHwidModal] = useState<License | null>(null);
  const [banningId, setBanningId] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");
  const [showSubModal, setShowSubModal] = useState(false);

  useEffect(() => {
    fetch("/api/apps").then(r => r.json()).then(d => {
      if (d.success && d.apps.length > 0) { setApps(d.apps); setSelectedApp(d.apps[0].id); }
    }).catch(console.error);
  }, []);

  const fetchLicenses = useCallback(async () => {
    if (!selectedApp) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/licenses?appId=${selectedApp}`);
      const data = await res.json();
      if (data.success) setLicenses(data.licenses);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [selectedApp]);

  useEffect(() => { fetchLicenses(); setNewlyGenerated([]); }, [fetchLicenses, selectedApp]);

  useEffect(() => {
    if (!selectedApp) return;
    fetch(`/api/files?appId=${selectedApp}`).then(r => r.json()).then(d => {
      if (d.success) setFiles(d.files);
    }).catch(console.error);
  }, [selectedApp]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || generating) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId: selectedApp, duration, amount, keyPattern: keyPattern || undefined, label: label || undefined }),
      });
      const data = await res.json();
      if (data.success) { 
        setLicenses(prev => [...data.licenses, ...prev]); 
        setNewlyGenerated(data.licenses); 
      } else if (res.status === 403 && data.error === "Subscription Required") {
        setShowSubModal(true);
      }
    } catch (e) { console.error(e); }
    finally { setGenerating(false); }
  };

  const handleDeleteAll = async () => {
    if (!selectedApp) return;
    const count = licenses.length;
    if (!confirm(`Delete ALL ${count} license key${count !== 1 ? "s" : ""} for this app? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/licenses/bulk?appId=${selectedApp}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { setLicenses([]); setNewlyGenerated([]); }
    } catch (e) { console.error(e); }
  };

  const handleCopyKey = async (lic: License) => {
    await navigator.clipboard.writeText(lic.key);
    setCopiedId(lic.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteLicense = async (id: string) => {
    if (!confirm("Permanently delete this license key?")) return;
    try {
      const res = await fetch(`/api/licenses/${id}`, { method: "DELETE" });
      if (res.ok) setLicenses(prev => prev.filter(l => l.id !== id));
    } catch (e) { console.error(e); }
  };

  const handleResetHwid = async (id: string) => {
    try {
      const res = await fetch(`/api/licenses/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resetHwid: true }) });
      if (res.ok) setLicenses(prev => prev.map(l => l.id === id ? { ...l, hwid: null, activations: 0 } : l));
    } catch (e) { console.error(e); }
    setHwidModal(null);
  };

  const handleBanLicense = async (id: string) => {
    try {
      const res = await fetch(`/api/licenses/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "BANNED", banReason }) });
      if (res.ok) { setLicenses(prev => prev.map(l => l.id === id ? { ...l, status: "BANNED" } : l)); setBanningId(null); setBanReason(""); }
    } catch (e) { console.error(e); }
  };

  const handleUnban = async (id: string) => {
    try {
      const res = await fetch(`/api/licenses/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "ACTIVE" }) });
      if (res.ok) setLicenses(prev => prev.map(l => l.id === id ? { ...l, status: "ACTIVE" } : l));
    } catch (e) { console.error(e); }
  };

  const statusBadge = (s: string) => ({
    ACTIVE: "badge-active",
    PAUSED: "badge-paused",
    BANNED: "badge-banned",
  }[s] || "bg-slate-500/10 border border-slate-500/30 text-slate-400");

  const previewPattern = keyPattern
    ? keyPattern.replace(/\*/g, "X")
    : "SECURE-XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX";

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <div className="bg-mesh" />
      <Sidebar />
      {hwidModal && <HwidResetModal lic={hwidModal} onConfirm={() => handleResetHwid(hwidModal.id)} onCancel={() => setHwidModal(null)} />}

      <main className="flex-1 p-8 overflow-y-auto z-10 animate-fadeIn">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-white/5 pb-6">
            <div>
              <h1 className="text-3xl font-extrabold font-outfit text-white tracking-tight flex items-center gap-3">
                <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                  <Key className="h-6 w-6" />
                </div>
                License Manager
              </h1>
              <p className="text-sm text-slate-400 mt-3 max-w-xl">
                Generate cryptographic tokens, manage active subscriptions, and enforce hardware binding per user.
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-white/[0.02] p-2 rounded-xl border border-white/5 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-2">App Node:</span>
              <div className="relative">
                <select value={selectedApp} onChange={e => setSelectedApp(e.target.value)} className="appearance-none bg-slate-900 border border-white/10 rounded-lg pl-4 pr-10 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-red-500 hover:bg-slate-800 transition-colors">
                  {apps.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="h-8 w-[1px] bg-white/10 mx-1" />
              <Link href={`/dashboard/app-users${selectedApp ? `?appId=${selectedApp}` : ""}`} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-transparent bg-white/5 text-xs font-bold text-slate-300 hover:text-red-300 hover:border-red-500/30 hover:bg-red-500/10 transition-all">
                <Users className="h-4 w-4" /> User Matrix
              </Link>
              <button onClick={fetchLicenses} className="p-2.5 rounded-lg bg-white/5 border border-transparent hover:border-white/20 text-slate-300 hover:text-white transition-all">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-red-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Generate Card */}
          <GlowCard glowColor="red" className="mb-8" withShimmer>
            <h3 className="text-sm font-bold mb-6 flex items-center gap-2 text-white">
              <div className="bg-red-500/20 p-1 rounded">
                <Plus className="h-4 w-4 text-red-400" />
              </div>
              Generate Access Tokens
            </h3>
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Duration Profile</label>
                  <select value={duration} onChange={e => setDuration(e.target.value)} className="input-premium">
                    <option value="1d">24 Hours (Trial)</option><option value="7d">1 Week</option><option value="30d">1 Month</option><option value="90d">3 Months</option><option value="180d">6 Months</option><option value="lifetime">Lifetime Access</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Batch Quantity</label>
                  <input type="number" min="1" max="100" value={amount} onChange={e => setAmount(parseInt(e.target.value) || 1)} className="input-premium" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest flex items-center gap-1.5">
                    <Tag className="h-3 w-3" /> CDN Payload Target
                  </label>
                  <select value={label} onChange={e => setLabel(e.target.value)} className="input-premium">
                    <option value="">Global (No specific file)</option>
                    {files.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={generating || !selectedApp} className="btn-primary h-[42px] flex items-center justify-center gap-2 w-full">
                  {generating ? <><RefreshCw className="h-4 w-4 animate-spin" /> Compiling...</> : <><Wand2 className="h-4 w-4" /> Forge Tokens</>}
                </button>
              </div>

              {/* Custom key pattern */}
              <div className="bg-black/30 border border-white/5 rounded-xl p-5 relative overflow-hidden">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Custom Mask Pattern</label>
                      <button type="button" onClick={() => setShowPatternHelp(h => !h)} className="text-slate-500 hover:text-white transition-colors bg-white/5 rounded p-0.5">
                        <HelpCircle className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="relative">
                      <input type="text" value={keyPattern} onChange={e => setKeyPattern(e.target.value)} placeholder="e.g. VIP-****-****-****" className="input-premium w-full font-mono placeholder-slate-700 bg-black/60 focus:bg-red-500/5" />
                      {keyPattern && <button type="button" onClick={() => setKeyPattern("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-400 bg-black rounded p-1"><X className="h-3 w-3" /></button>}
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full bg-red-500/5 border border-red-500/10 rounded-lg p-4 h-full min-h-[66px] flex flex-col justify-center">
                    <span className="text-[9px] text-red-400/70 uppercase font-bold tracking-widest mb-1 flex items-center gap-1.5"><Eye className="h-3 w-3" /> Live Output Preview</span>
                    <span className="font-mono text-sm font-bold text-red-300 tracking-wider">
                      {keyPattern ? previewPattern : <span className="opacity-50">SECURE-XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX</span>}
                    </span>
                  </div>
                </div>
                
                {showPatternHelp && (
                  <div className="mt-4 p-4 bg-slate-900 border border-white/10 rounded-lg text-xs text-slate-400 space-y-2 animate-fadeIn border-l-2 border-l-red-500">
                    <p className="flex items-start gap-2"><span className="text-red-400 font-bold">•</span> Use <code className="bg-black text-red-300 px-1.5 py-0.5 rounded font-mono">*</code> as a placeholder for a randomized uppercase hex character.</p>
                    <p className="flex items-start gap-2"><span className="text-red-400 font-bold">•</span> Example: <code className="bg-black text-red-300 px-1.5 py-0.5 rounded font-mono">SPOOFER-****-****-****</code> generates <code className="bg-black text-slate-300 px-1.5 py-0.5 rounded font-mono">SPOOFER-A3F2-7B1D-C9E8</code></p>
                    <p className="flex items-start gap-2"><span className="text-red-400 font-bold">•</span> Leave empty to use the standard high-entropy 256-bit algorithm format.</p>
                  </div>
                )}
              </div>
            </form>
          </GlowCard>

          {/* New keys banner */}
          {newlyGenerated.length > 0 && <NewKeysBanner newKeys={newlyGenerated} onDismiss={() => setNewlyGenerated([])} />}

          {/* Ban inline */}
          {banningId && (
            <div className="mb-6 bg-red-950/40 border border-red-500/30 rounded-xl p-5 flex flex-wrap gap-4 items-center animate-slideUp shadow-[0_0_20px_rgba(239,68,68,0.15)]">
              <div className="h-10 w-10 bg-red-500/20 rounded-full flex items-center justify-center shrink-0 border border-red-500/30">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <span className="text-[10px] text-red-400/80 font-bold uppercase tracking-widest block mb-1">Revoke License Access</span>
                <input autoFocus value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Specify violation reason (optional)..." className="w-full bg-black/40 border border-red-500/30 text-xs text-white rounded-lg px-3 py-2 outline-none focus:border-red-400 transition-colors" />
              </div>
              <div className="flex gap-2 items-end h-full pt-4">
                <button onClick={() => { setBanningId(null); setBanReason(""); }} className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 text-xs font-bold rounded-lg hover:bg-white/10 transition-colors">Cancel</button>
                <button onClick={() => handleBanLicense(banningId)} className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-500 border-none text-white text-xs font-bold rounded-lg hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all">Execute Ban</button>
              </div>
            </div>
          )}

          {/* Licenses table */}
          <GlowCard glowColor="red" className="p-0 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between flex-wrap gap-4 bg-white/[0.01]">
              <h3 className="text-sm font-bold flex items-center gap-3 text-white">
                <div className="bg-red-500/20 p-1.5 rounded-lg border border-red-500/30">
                  <Shield className="h-4 w-4 text-red-400" />
                </div>
                Active Token Registry
                <span className="px-2.5 py-0.5 bg-red-500/10 border border-red-500/30 rounded-full text-[10px] text-red-400 font-mono shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                  {licenses.length} RECORDS
                </span>
              </h3>
              {licenses.length > 0 && (
                <button onClick={handleDeleteAll} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/20 hover:border-red-500/40 transition-all">
                  <Trash2 className="h-4 w-4" /> Purge Database
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500 font-mono text-xs gap-4">
                <div className="relative">
                  <div className="h-10 w-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 h-10 w-10 border-2 border-red-500/30 rounded-full"></div>
                </div>
                Fetching cryptographic records...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 premium-table">
                  <thead>
                    <tr className="bg-black/40 border-b border-white/10 text-slate-400 uppercase font-bold text-[10px] tracking-widest">
                      <th className="py-4 px-6 w-1/3">License Signature</th>
                      <th className="px-4">Payload Target</th>
                      <th className="px-4">Lifespan</th>
                      <th className="px-4">HWID Node</th>
                      <th className="px-4">Network Status</th>
                      <th className="px-6 text-right">Sys Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenses.map(lic => (
                      <tr key={lic.id} className={`border-b border-white/5 ${newlyGenerated.find(n => n.id === lic.id) ? "bg-emerald-500/[0.05]" : ""}`}>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-white tracking-wider bg-black/50 px-2 py-1 rounded border border-white/5 shadow-inner">{lic.key}</span>
                            <button onClick={() => handleCopyKey(lic)} className={`shrink-0 p-1.5 rounded-md transition-colors ${copiedId === lic.id ? "bg-red-500/20 text-red-400" : "bg-white/5 text-slate-500 hover:text-red-400 hover:bg-red-500/10"}`}>
                              {copiedId === lic.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-4">
                          {lic.label ? <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-300 rounded font-bold text-[9px] uppercase tracking-wider">{lic.label}</span> : <span className="text-slate-600 text-xs opacity-50">—</span>}
                        </td>
                        <td className="px-4">
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1.5 font-bold"><Clock className="h-3.5 w-3.5 text-slate-500" />{lic.duration}</span>
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest">{lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString() : "Permanent"}</span>
                          </div>
                        </td>
                        <td className="px-4">
                          {lic.hwid ? (
                            <div className="flex flex-col gap-1.5 items-start">
                              <span className="font-mono text-[10px] text-orange-300 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 flex items-center gap-1">
                                <Fingerprint className="h-3 w-3 text-orange-400" />
                                {lic.hwid.substring(0, 8)}…
                              </span>
                              <button onClick={() => setHwidModal(lic)} className="text-[9px] uppercase font-bold tracking-widest text-orange-400 hover:text-white transition-colors">Reset Binding →</button>
                            </div>
                          ) : <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest bg-slate-800 px-2 py-1 rounded">Unbound</span>}
                        </td>
                        <td className="px-4">
                          <span className={`badge ${statusBadge(lic.status)}`}>
                            <div className="badge-dot" />
                            {lic.status}
                          </span>
                        </td>
                        <td className="px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {lic.status === "BANNED"
                              ? <button onClick={() => handleUnban(lic.id)} className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all hover:scale-105" title="Restore Access"><Shield className="h-4 w-4" /></button>
                              : <button onClick={() => setBanningId(lic.id)} className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 transition-all hover:scale-105" title="Suspend Token"><Ban className="h-4 w-4" /></button>}
                            <div className="h-4 w-[1px] bg-white/10" />
                            <button onClick={() => handleDeleteLicense(lic.id)} className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all hover:scale-105" title="Terminate Data"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {licenses.length === 0 && (
                      <tr><td colSpan={6} className="text-center text-slate-500 py-20 bg-black/20">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/10 mb-4 shadow-inner">
                          <Key className="h-8 w-8 text-slate-600" />
                        </div>
                        <p className="font-bold">Database is empty.</p>
                        <p className="text-[10px] uppercase tracking-widest mt-1 opacity-70">Initialize your first key above to begin tracking.</p>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </GlowCard>
        </div>
      </main>
    </div>
  );
}
