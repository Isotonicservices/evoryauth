"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { GlowCard } from "@/components/glow-card";
import { 
  Database, Plus, Trash2, Copy, Check, Upload, 
  RefreshCw, FileCode, Clock, Box, HardDrive, 
  Server, ArrowUpCircle, X, ChevronDown, CheckCircle2 
} from "lucide-react";
import { motion } from "framer-motion";

interface CDNFile {
  id: string;
  name: string;
  size: number;
  version: string;
  downloads: number;
  createdAt: string;
  path: string;
}

export default function FileCDN() {
  const [apps, setApps] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedApp, setSelectedApp] = useState("");
  const [files, setFiles] = useState<CDNFile[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Inputs
  const [filePayload, setFilePayload] = useState<File | null>(null);
  const [version, setVersion] = useState("1.0");
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await fetch("/api/apps");
        const data = await res.json();
        if (data.success && data.apps.length > 0) {
          setApps(data.apps);
          setSelectedApp(data.apps[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchApps();
  }, []);

  const fetchFiles = useCallback(async () => {
    if (!selectedApp) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/files?appId=${selectedApp}`);
      const data = await res.json();
      if (data.success) {
        setFiles(data.files);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedApp]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUploadFile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedApp || !filePayload || uploading) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("appId", selectedApp);
      formData.append("version", version);
      formData.append("file", filePayload);

      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setFiles([data.file, ...files]);
        setFilePayload(null);
        setVersion("1.0");
        const fileInput = document.getElementById("file-upload-input") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        alert(data.error || "Failed to upload file");
      }
    } catch (e) {
      console.error(e);
      alert("Network error occurred during file upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (id: string) => {
    if (!confirm("Permanently purge this binary payload from CDN nodes?")) return;
    try {
      const res = await fetch(`/api/files/${id}`, { method: "DELETE" });
      if (res.ok) {
        setFiles(files.filter((f) => f.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReplaceFile = async (id: string, file: File, currentVersion: string) => {
    const newVersion = prompt("Specify new version identifier (leave empty to retain current):", currentVersion);
    if (newVersion === null) return;

    setReplacingId(id);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("version", newVersion || currentVersion);

      const res = await fetch(`/api/files/${id}`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setFiles(files.map((f) => (f.id === id ? data.file : f)));
      } else {
        alert(data.error || "Failed to push update");
      }
    } catch (e) {
      console.error(e);
      alert("Network error occurred during deployment");
    } finally {
      setReplacingId(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFilePayload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <div className="bg-mesh" />
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto z-10 animate-fadeIn">
        <div className="max-w-7xl mx-auto">
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-white/5 pb-6">
            <div>
              <h1 className="text-3xl font-extrabold font-outfit text-white tracking-tight flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <Database className="h-6 w-6" />
                </div>
                CDN File Edge
              </h1>
              <p className="text-sm text-slate-400 mt-3 max-w-xl">
                Deploy executable payloads, DLLs, and drivers to edge nodes. Stream directly to client software.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/[0.02] p-2 rounded-xl border border-white/5 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider ml-2">App Node:</span>
              <div className="relative">
                <select value={selectedApp} onChange={e => setSelectedApp(e.target.value)} className="appearance-none bg-slate-900 border border-white/10 rounded-lg pl-4 pr-10 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 hover:bg-slate-800 transition-colors">
                  {apps.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="h-8 w-[1px] bg-white/10 mx-1" />
              <button onClick={fetchFiles} className="p-2.5 rounded-lg bg-white/5 border border-transparent hover:border-white/20 text-slate-300 hover:text-white transition-all">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Zone */}
            <div className="lg:col-span-1">
              <GlowCard glowColor="cyan" className="sticky top-8" withShimmer>
                <h3 className="text-sm font-bold mb-6 flex items-center gap-2 text-white">
                  <Upload className="h-4 w-4 text-cyan-400" /> Push Payload
                </h3>
                
                <form onSubmit={handleUploadFile} className="flex flex-col gap-5">
                  <div 
                    onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all p-8 flex flex-col items-center justify-center text-center gap-4 ${
                      isDragOver 
                        ? "border-cyan-500 bg-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.2)]" 
                        : "border-white/10 bg-black/40 hover:border-cyan-500/50 hover:bg-white/[0.02]"
                    }`}
                  >
                    {isDragOver && <div className="absolute inset-0 bg-cyan-500/5 backdrop-blur-[2px]" />}
                    
                    {filePayload ? (
                      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-3 relative z-10">
                        <div className="h-16 w-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                          <FileCode className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm break-all">{filePayload.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-1">{(filePayload.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                        <button type="button" onClick={() => setFilePayload(null)} className="mt-2 text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-bold"><X className="h-3 w-3" /> Remove Selection</button>
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 relative z-10 pointer-events-none">
                        <div className="h-14 w-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <Upload className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-bold text-slate-300">Drag & Drop Binary Here</p>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">DLL • EXE • SYS • DAT</p>
                      </div>
                    )}
                    
                    {!filePayload && (
                      <input
                        id="file-upload-input"
                        type="file"
                        onChange={(e) => setFilePayload(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Version Tag</label>
                    <input
                      type="text"
                      required
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      placeholder="e.g. 2.5.1"
                      className="input-premium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={uploading || !filePayload}
                    className="btn-primary mt-2 flex items-center justify-center gap-2 h-12"
                  >
                    {uploading ? (
                      <><RefreshCw className="h-4 w-4 animate-spin" /> Deploying to Edge...</>
                    ) : (
                      <><ArrowUpCircle className="h-5 w-5" /> Execute Upload</>
                    )}
                  </button>
                </form>
              </GlowCard>
            </div>

            {/* Hosted Files list */}
            <div className="lg:col-span-2">
              <GlowCard glowColor="none" className="p-0 border border-white/5 overflow-hidden h-full flex flex-col">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                  <h3 className="text-sm font-bold flex items-center gap-3 text-white">
                    <div className="bg-white/10 p-1.5 rounded-lg border border-white/20">
                      <Server className="h-4 w-4 text-slate-300" />
                    </div>
                    Distributed Edge Nodes
                    <span className="px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-[10px] text-blue-400 font-mono shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                      {files.length} PAYLOADS
                    </span>
                  </h3>
                </div>

                {loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500 font-mono text-xs gap-4">
                    <div className="relative">
                      <div className="h-10 w-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-0 h-10 w-10 border-2 border-cyan-500/30 rounded-full"></div>
                    </div>
                    Syncing edge servers...
                  </div>
                ) : files.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-24 text-slate-500 px-6 text-center bg-black/20">
                    <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center border border-dashed border-white/10 mb-6">
                      <Box className="h-10 w-10 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 font-outfit">No Payloads Found</h3>
                    <p className="text-xs max-w-sm">Push your first binary to the CDN using the deployment zone to begin serving it to your client applications.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-xs text-slate-300 premium-table">
                      <thead>
                        <tr className="bg-black/40 border-b border-white/10 text-slate-400 uppercase font-bold text-[10px] tracking-widest">
                          <th className="py-4 px-6">Payload Header</th>
                          <th className="px-4">Integration Details</th>
                          <th className="px-4">Telemetry</th>
                          <th className="px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {files.map((file) => {
                          const cppSnippet = `Evory AuthApp.download("${file.id}");`;
                          return (
                            <tr key={file.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 bg-cyan-500/10 rounded-xl border border-cyan-500/20 flex items-center justify-center shrink-0">
                                    <HardDrive className="h-5 w-5 text-cyan-400" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-white text-sm mb-0.5">{file.name}</p>
                                    <div className="flex items-center gap-2">
                                      <span className="badge badge-active py-0 px-1.5 text-[9px]">v{file.version}</span>
                                      <span className="text-[10px] text-slate-500 font-mono">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 w-12">UUID</span>
                                    <div 
                                      className="flex items-center gap-1 bg-black/50 border border-white/5 px-2 py-0.5 rounded text-[10px] shadow-inner group cursor-pointer hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-colors" 
                                      onClick={() => handleCopy(file.id, `${file.id}-uuid`)}
                                    >
                                      <code className="font-mono text-cyan-300 break-all select-none">{file.id}</code>
                                      {copiedId === `${file.id}-uuid` ? <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" /> : <Copy className="h-3 w-3 text-slate-500 group-hover:text-cyan-400 shrink-0" />}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 w-12">C++</span>
                                    <div className="flex items-center gap-1 bg-black/50 border border-white/5 px-2 py-0.5 rounded text-[10px] shadow-inner group cursor-pointer w-48 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-colors" onClick={() => handleCopy(cppSnippet, `${file.id}-cpp`)}>
                                      <code className="font-mono text-emerald-400 truncate flex-1 select-none">{cppSnippet}</code>
                                      {copiedId === `${file.id}-cpp` ? <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" /> : <Copy className="h-3 w-3 text-slate-500 group-hover:text-cyan-400 shrink-0" />}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4">
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <ArrowUpCircle className="h-3 w-3 text-emerald-400" />
                                    <span className="font-bold text-white">{file.downloads.toLocaleString()} <span className="text-slate-500 font-normal">pulls</span></span>
                                  </div>
                                  <div className="flex items-center gap-2 text-slate-500 text-[10px]">
                                    <Clock className="h-3 w-3" />
                                    <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <label className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all hover:scale-105 cursor-pointer flex items-center justify-center" title="Push Update">
                                    {replacingId === file.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                    <input type="file" className="hidden" disabled={replacingId !== null} onChange={async (e) => { const selected = e.target.files?.[0]; if (selected) await handleReplaceFile(file.id, selected, file.version); }} />
                                  </label>
                                  <div className="h-4 w-[1px] bg-white/10" />
                                  <button onClick={() => handleDeleteFile(file.id)} className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all hover:scale-105" title="Purge Node"><Trash2 className="h-4 w-4" /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </GlowCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
