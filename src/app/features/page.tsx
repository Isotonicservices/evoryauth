"use client";

import React from "react";
import { motion } from "framer-motion";
import { ParticleBg } from "@/components/particle-bg";
import { Navigation } from "@/components/navigation";
import { GlowCard } from "@/components/glow-card";
import { ShieldCheck, HardDrive, Key, Globe, Eye, Code, Zap } from "lucide-react";

export default function Features() {
  const list = [
    {
      icon: <ShieldCheck className="h-8 w-8 text-blue-400" />,
      title: "AES 256 Handshake Protection",
      description: "Prevent reverse engineers from interception. Custom challenge handshakes ensure validation calls are fully authenticated.",
    },
    {
      icon: <HardDrive className="h-8 w-8 text-purple-400" />,
      title: "Hardware Lock (HWID)",
      description: "Lock instances to specific CPUs, motherboards, or network configurations. Prevent multiple clients from reusing a single key.",
    },
    {
      icon: <Key className="h-8 w-8 text-cyan-400" />,
      title: "Flexible Expiration Durations",
      description: "Create Lifetime, 1 Day, 7 Days, or Custom Duration keys in bulk via the dashboard. Pause keys anytime or ban malicious users.",
    },
    {
      icon: <Globe className="h-8 w-8 text-emerald-400" />,
      title: "Secure File CDN Hosting",
      description: "Upload updates and installers directly to the Evory Auth CDN. Secure links are verified against license validity before downloading.",
    },
    {
      icon: <Eye className="h-8 w-8 text-yellow-400" />,
      title: "Audit Logging",
      description: "Track precise login records, user registration IPs, validation attempts, and failure flags straight from your control panel.",
    },
    {
      icon: <Code className="h-8 w-8 text-pink-400" />,
      title: "Multi-Language Integrations",
      description: "Use pre-built, robust libraries inside C++, C#, Python, JavaScript, and Lua files for quick software instrumentation.",
    },
  ];

  return (
    <main className="relative min-h-screen text-slate-100 pb-20">
      <ParticleBg />
      <Navigation />

      <section className="relative z-10 pt-36 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-outfit text-4xl md:text-6xl font-extrabold mb-4">
            Security Features Built for <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent text-neon-blue">
              Scale & Protection
            </span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            From client-side handshakes to server-side rate limits, Evory Auth secures your applications against tampering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((feat, i) => (
            <GlowCard key={i} glowColor={i % 2 === 0 ? "blue" : "purple"}>
              <div className="mb-4">{feat.icon}</div>
              <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feat.description}</p>
            </GlowCard>
          ))}
        </div>
      </section>
    </main>
  );
}
