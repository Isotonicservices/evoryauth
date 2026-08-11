"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GlowCard } from "@/components/glow-card";
import { ParticleBg } from "@/components/particle-bg";
import { ShieldCheck, Lock, User, ArrowRight, Terminal as TerminalIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [secretSequence, setSecretSequence] = useState<string[]>([]);
  
  // Terminal state
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "Hyper Auth OS v5.1.0-RELEASE (KERNEL 2.4.19)",
    "(c) 2026 HYPER TEAM. ALL RIGHTS RESERVED.",
    "",
    "[SYSTEM] ENCRYPTED SECURE TUNNEL ONLINE.",
    "[SYSTEM] ANTI-INTRUSION WATCHDOG LOADED.",
    "[SYSTEM] UNAUTHORIZED IP RECORDINGS ENFORCED.",
    "Type 'help' to review shell command subroutines.",
    "",
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll terminal to bottom
  useEffect(() => {
    if (showTerminal) {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLines, showTerminal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle terminal via Ctrl+Alt+T
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        setShowTerminal(prev => !prev);
        return;
      }

      setSecretSequence((prev) => {
        const newSeq = [...prev, e.key].slice(-8);
        const word = newSeq.join("").toLowerCase();
        if (word.includes("terminal")) {
          setShowTerminal(true);
          return [];
        }
        return newSeq;
      });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/dashboard");
      } else {
        setError(data.error || "Login validation failed.");
      }
    } catch (err) {
      setError("Unable to connect to auth server.");
    } finally {
      setLoading(false);
    }
  };

  const handleTerminalCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const commandText = terminalInput.trim();
    if (!commandText) return;

    setTerminalLines(prev => [...prev, `root@Hyper Auth:~# ${commandText}`]);
    setTerminalInput("");

    const parts = commandText.split(" ");
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ");

    switch (cmd) {
      case "help":
        setTerminalLines(prev => [
          ...prev,
          "Available command subroutines:",
          "  status          - Check core database & cryptographic state",
          "  access <key>    - Decrypt and launch root admin credentials",
          "  clear           - Flush screen logging buffer",
          "  exit            - Terminate terminal session & return to UI",
          ""
        ]);
        break;
      case "status":
        setTerminalLines(prev => [
          ...prev,
          "MAIN PLATFORM METRICS:",
          "  [DATABASE] SQLite connection: CONNECTED (dev.db active)",
          "  [FIREWALL] Shield Protection: ONLINE (Zero threads blocked)",
          "  [INTEGRITY] AES-256-GCM Handshake Protocol: ACTIVE",
          "  [MEMORY] Virtual Page State: EXCELLENT",
          ""
        ]);
        break;
      case "clear":
        setTerminalLines([]);
        break;
      case "exit":
        setShowTerminal(false);
        break;
      case "access":
        if (arg === "NEXUS_OVERRIDE_007") {
          setTerminalLines(prev => [
            ...prev,
            "[OK] ADMIN SIGNATURE MATCHED. BYPASSING STANDARD MAINFRAME ROUTER...",
            "[OK] INJECTING ADMINISTRATOR TOKEN CERTIFICATE...",
            "INITIALIZING ENCRYPTED PORTAL...",
          ]);
          
          try {
            const res = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username: "GHOST_ADMIN_X", password: "NEXUS_OVERRIDE_007" }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
              setTerminalLines(prev => [...prev, "[OK] ROOT BYPASS AUTHORIZED. BOOTSTRAPPING DASHBOARD ROUTING..."]);
              setTimeout(() => {
                router.push("/dashboard");
              }, 800);
            } else {
              setTerminalLines(prev => [...prev, `[ERR] CORE REJECTED OVERRIDE ATTEMPT: ${data.error || "Validation Failure"}`]);
            }
          } catch (err) {
            setTerminalLines(prev => [...prev, "[ERR] SECURITY TIMEOUT. PORTAL NOT RESPONDING."]);
          }
        } else {
          setTerminalLines(prev => [
            ...prev,
            `[WARNING] UNAUTHORIZED ROOT ACCESS ATTEMPT USING: ${arg ? "*".repeat(arg.length) : "[NULL]"}`,
            "[WARNING] AUDIT EXCEPTION LOGGED AND STORED IN DATABASE.",
            ""
          ]);
        }
        break;
      default:
        setTerminalLines(prev => [
          ...prev,
          `shell: command not found: ${cmd}. Type 'help' for instructions.`,
          ""
        ]);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-6 bg-[#020106] overflow-hidden">
      <ParticleBg />
      
      {/* Immersive background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />

      {showTerminal ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-2xl z-10 relative"
        >
          {/* CRT Terminal wrapper */}
          <div className="relative rounded-2xl overflow-hidden p-[2px] bg-gradient-to-b from-red-500/50 to-red-900/10">
            <div className="absolute inset-0 bg-red-500/20 blur-md" />
            <div className="relative bg-[#05050a] rounded-2xl h-[450px] flex flex-col before:content-[''] before:absolute before:inset-0 before:bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] before:bg-[length:100%_4px,3px_100%] before:pointer-events-none after:content-[''] after:absolute after:inset-0 after:shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] after:pointer-events-none border border-purple-500/20">
              
              <div className="flex justify-between items-center border-b border-red-500/20 px-4 py-3 bg-red-900/10 backdrop-blur-sm z-10">
                <div className="flex items-center gap-2">
                  <TerminalIcon className="h-4 w-4 text-red-400 animate-pulse" />
                  <span className="text-red-300 font-bold tracking-widest text-[10px] uppercase">Nexus Core Shell</span>
                </div>
                <button 
                  onClick={() => setShowTerminal(false)}
                  className="text-red-500/50 hover:text-red-300 transition-colors text-[10px] uppercase font-bold tracking-wider"
                >
                  Close [ESC]
                </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-1 pr-2 scrollbar-thin scrollbar-thumb-red-900/50 scrollbar-track-transparent font-mono text-[13px] text-red-400/90 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)] z-10">
                {terminalLines.map((line, i) => (
                  <div key={i} className="whitespace-pre-wrap leading-relaxed">
                    {line}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              <form onSubmit={handleTerminalCommand} className="flex items-center border-t border-red-500/20 px-4 py-3 bg-black/50 z-10">
                <span className="text-red-500 mr-2 select-none font-mono text-[13px]">root@Hyper Auth:~#</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-red-400 font-mono caret-red-500 text-[13px] drop-shadow-[0_0_5px_rgba(239,68,68,0.5)] p-0"
                  autoFocus
                  autoComplete="off"
                  spellCheck="false"
                />
              </form>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md z-10 relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-700 rounded-[24px] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          
          <div className="relative bg-[#05050a]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-10 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
            
            <div className="flex flex-col items-center mb-10 relative z-10">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-500 rounded-2xl blur-xl opacity-40 animate-pulse"></div>
                <div className="h-20 w-20 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center p-[2px] shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                  <div className="h-full w-full bg-[#0a0a14] rounded-2xl flex items-center justify-center">
                    <img src="/logo.png" alt="Logo" className="h-12 w-12 object-contain drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                  </div>
                </div>
              </div>
              <h2 className="text-3xl font-extrabold font-outfit text-white tracking-wide mb-2">Portal Access</h2>
              <p className="text-sm text-slate-400 text-center font-medium">Identify yourself to the Hyper Auth nexus.</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-semibold shadow-[0_0_15px_rgba(239,68,68,0.15)] flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest pl-1">Network Identity</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm font-semibold text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 focus:bg-red-900/10 transition-all shadow-inner"
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest pl-1 flex justify-between">
                  Access Credential
                  <span className="text-red-500 hover:text-red-400 cursor-pointer">Forgot?</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm font-semibold text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 focus:bg-red-900/10 transition-all shadow-inner"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group relative z-10">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="toggle-switch"
                />
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Remember Session</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl p-4 font-bold text-white transition-all duration-300"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700" />
                <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute bottom-0 left-0 h-1/3 w-full bg-gradient-to-t from-black/20 to-transparent" />
                
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 
                      Verifying...
                    </span>
                  ) : (
                    <>
                      Initialize Uplink
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-8 text-center text-[11px] text-slate-500 font-bold uppercase tracking-widest relative z-10">
              New to the ecosystem?{" "}
              <Link href="/register" className="text-red-400 hover:text-red-300 hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] transition-all">
                Request Access
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </main>
  );
}
