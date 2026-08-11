"use client";

import React, { useEffect, useState } from "react";
import { ParticleBg } from "@/components/particle-bg";
import { Navigation } from "@/components/navigation";
import { GlowCard } from "@/components/glow-card";
import { CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export default function Status() {
  const [latency, setLatency] = useState<Record<string, number>>({});

  useEffect(() => {
    // Generate simulated dynamic latencies
    setLatency({
      "Authentication Handshake API": Math.floor(Math.random() * 40) + 10,
      "Developer Portal Dashboard": Math.floor(Math.random() * 80) + 30,
      "Prisma Database Service (US-East)": Math.floor(Math.random() * 15) + 5,
      "Secure CDN Download System": Math.floor(Math.random() * 120) + 60,
    });
  }, []);

  return (
    <main className="relative min-h-screen text-slate-100 pb-20">
      <ParticleBg />
      <Navigation />

      <section className="relative z-10 pt-36 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-outfit text-4xl md:text-6xl font-extrabold mb-4">
            System Operations & <br />
            <span className="bg-gradient-to-r from-red-400 to-white bg-clip-text text-transparent">
              Real-Time Status
            </span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Live latency reports and connectivity health scores for the Hyper Auth network infrastructure.
          </p>
        </div>

        <GlowCard glowColor="red" className="mb-8">
          <div className="flex items-center gap-3 mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400">
            <CheckCircle2 className="h-6 w-6 shrink-0" />
            <div>
              <h3 className="font-bold text-sm">All Systems Operational</h3>
              <p className="text-xs text-red-500/80">No outages or security breaches registered in the last 30 days.</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {Object.entries(latency).map(([name, ping]) => (
              <div key={name} className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-xs text-slate-300 font-semibold">{name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-slate-500">{ping} ms</span>
                  <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </GlowCard>

        {/* Global stats info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlowCard glowColor="red">
            <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-red-400" /> DDOS Mitigation Layer
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Rate limits and Cloudflare enterprise scrubbers are active. Any IP attempting credential stuffing or signature spoofing is automatically locked for 24 hours.
            </p>
          </GlowCard>
          <GlowCard glowColor="red">
            <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
              Uptime SLA Guarantee
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We maintain a strict 99.9% availability target. Failovers are dynamically routed to back-up systems via geographically distributed servers.
            </p>
          </GlowCard>
        </div>
      </section>
    </main>
  );
}
