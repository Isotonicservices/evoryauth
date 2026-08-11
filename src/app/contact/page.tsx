"use client";

import React, { useState } from "react";
import { ParticleBg } from "@/components/particle-bg";
import { Navigation } from "@/components/navigation";
import { GlowCard } from "@/components/glow-card";
import { Mail, Send, CheckCircle2 } from "lucide-react";

export default function Contact() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <main className="relative min-h-screen text-slate-100 pb-20">
      <ParticleBg />
      <Navigation />

      <section className="relative z-10 pt-36 px-6 max-w-xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-outfit text-4xl md:text-5xl font-extrabold mb-4">
            Get in Touch with <br />
            <span className="bg-gradient-to-r from-red-400 to-white bg-clip-text text-transparent text-neon-red">
              Security Advisors
            </span>
          </h1>
          <p className="text-slate-400 max-w-sm mx-auto text-xs">
            Submit a query to our developer support department. We reply within 24 hours.
          </p>
        </div>

        <GlowCard glowColor="red">
          {submitted ? (
            <div className="text-center py-8 flex flex-col items-center gap-4">
              <CheckCircle2 className="h-12 w-12 text-green-400" />
              <div>
                <h3 className="font-bold text-base text-white">Ticket Submitted</h3>
                <p className="text-xs text-slate-500 mt-1">Our customer experience agents are reviewing your request.</p>
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 bg-slate-900 border border-white/10 hover:border-red-500 rounded-lg text-xs transition-colors text-slate-300"
              >
                Submit another ticket
              </button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-bold">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500 text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-bold">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="e.g. License API request error"
                  className="bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500 text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-bold">Query message</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder="Detailed explanation..."
                  className="bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500 text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="mt-2 bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 rounded-lg text-xs transition-all duration-300 flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                <Send className="h-3.5 w-3.5" /> Submit Ticket
              </button>
            </form>
          )}
        </GlowCard>
      </section>
    </main>
  );
}
