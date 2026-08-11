import React from "react";
import { motion } from "framer-motion";
import { ParticleBg } from "@/components/particle-bg";
import { Navigation } from "@/components/navigation";
import { GlowCard } from "@/components/glow-card";
import { Check, Zap, Shield, Crown } from "lucide-react";

export default function Pricing() {
  return (
    <main className="relative min-h-screen text-slate-100 pb-20">
      <ParticleBg />
      <Navigation />

      <section className="relative z-10 pt-36 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-outfit text-4xl md:text-6xl font-extrabold mb-4">
            Simple, Transparent <br />
            <span className="bg-gradient-to-r from-red-400 to-white bg-clip-text text-transparent">
              Pricing Plans
            </span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Choose the plan that fits your needs. All plans include core security features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <GlowCard glowColor="red" className="p-8 relative">
            <div className="mb-6">
              <h3 className="text-xl font-bold font-outfit mb-2">Free</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">$0</span>
                <span className="text-slate-400">/month</span>
              </div>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-red-400 shrink-0" />
                <span>Up to 5 Applications</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-red-400 shrink-0" />
                <span>100 License Keys</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-red-400 shrink-0" />
                <span>Basic HWID Lock</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-red-400 shrink-0" />
                <span>Community Support</span>
              </li>
            </ul>
            <button className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 font-semibold hover:bg-red-500/10 transition-all">
              Get Started
            </button>
          </GlowCard>

          {/* Pro Plan */}
          <GlowCard glowColor="red" className="p-8 relative border-red-500/50">
            <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
              POPULAR
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-bold font-outfit mb-2">Pro</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">$29</span>
                <span className="text-slate-400">/month</span>
              </div>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-red-400 shrink-0" />
                <span>Unlimited Applications</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-red-400 shrink-0" />
                <span>Unlimited License Keys</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-red-400 shrink-0" />
                <span>Advanced HWID Lock</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-red-400 shrink-0" />
                <span>Priority Support</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-red-400 shrink-0" />
                <span>API Access</span>
              </li>
            </ul>
            <button className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              Start Free Trial
            </button>
          </GlowCard>

          {/* Enterprise Plan */}
          <GlowCard glowColor="red" className="p-8 relative">
            <div className="mb-6">
              <h3 className="text-xl font-bold font-outfit mb-2 flex items-center gap-2">
                Enterprise
                <Crown className="h-5 w-5 text-red-400" />
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">$99</span>
                <span className="text-slate-400">/month</span>
              </div>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-red-400 shrink-0" />
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-red-400 shrink-0" />
                <span>Custom CDN</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-red-400 shrink-0" />
                <span>White Label</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-red-400 shrink-0" />
                <span>Dedicated Support</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Check className="h-5 w-5 text-red-400 shrink-0" />
                <span>SLA Guarantee</span>
              </li>
            </ul>
            <button className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 font-semibold hover:bg-red-500/10 transition-all">
              Contact Sales
            </button>
          </GlowCard>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlowCard glowColor="red" className="p-6 text-center">
            <Zap className="h-10 w-10 text-red-400 mx-auto mb-4" />
            <h3 className="font-bold mb-2">Lightning Fast</h3>
            <p className="text-sm text-slate-400">Sub-100ms validation response times globally.</p>
          </GlowCard>
          <GlowCard glowColor="red" className="p-6 text-center">
            <Shield className="h-10 w-10 text-red-400 mx-auto mb-4" />
            <h3 className="font-bold mb-2">Enterprise Security</h3>
            <p className="text-sm text-slate-400">AES-256 encryption with RSA key exchange.</p>
          </GlowCard>
          <GlowCard glowColor="red" className="p-6 text-center">
            <Crown className="h-10 w-10 text-red-400 mx-auto mb-4" />
            <h3 className="font-bold mb-2">99.9% Uptime</h3>
            <p className="text-sm text-slate-400">Guaranteed availability with failover systems.</p>
          </GlowCard>
        </div>
      </section>
    </main>
  );
}
