"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ParticleBg } from "@/components/particle-bg";
import { Navigation } from "@/components/navigation";
import { GlowCard } from "@/components/glow-card";
import { Terminal, Code, Server, BookOpen, Layers, Lock } from "lucide-react";

export default function Documentation() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/check");
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(data.authenticated);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <main className="relative min-h-screen text-slate-100">
        <ParticleBg />
        <Navigation />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Lock className="h-12 w-12 text-red-400 mx-auto mb-4 animate-pulse" />
            <p className="text-slate-400">Verifying access...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="relative min-h-screen text-slate-100">
        <ParticleBg />
        <Navigation />
        <div className="flex items-center justify-center h-screen px-6">
          <GlowCard glowColor="red" className="max-w-md w-full p-8 text-center">
            <Lock className="h-16 w-16 text-red-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold font-outfit mb-4">Documentation Restricted</h2>
            <p className="text-slate-400 mb-6">
              Documentation and SDK access is available to registered users only. Please log in to view integration guides and API references.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
            >
              Login to Access
            </button>
          </GlowCard>
        </div>
      </main>
    );
  }

  const [activeTab, setActiveTab] = useState<"api" | "sdk">("api");

  const cppExample = `#include <iostream>
#include <Windows.h>
#include <vector>
#include "auth.hpp"

using namespace KeyAuth;

std::string name = "App_Name";
std::string ownerid = "Owner_ID";
std::string secret = "App_Secret";
std::string version = "1.0";
std::string url = "https://hyperauth.online/api/client";
std::string path = ""; 

api KeyAuthApp(name, ownerid, secret, version, url, path);

int main() {
    KeyAuthApp.init();

    std::string licenseKey;
    std::cout << "Enter your License Key: ";
    std::cin >> licenseKey;

    KeyAuthApp.license(licenseKey);

    if (KeyAuthApp.response.success) {
        std::cout << "Login Successful!" << std::endl;
        
        std::string file_id = "YOUR_FILE_UUID_HERE";
        std::vector<uint8_t> downloaded_file = KeyAuthApp.download(file_id, licenseKey);
        
        if (downloaded_file.size() > 0) {
            std::cout << "Successfully downloaded file!" << std::endl;
        }
    } else {
        std::cout << "Error: " << KeyAuthApp.response.message << std::endl;
    }
    return 0;
}`;

  const pythonExample = `# Python SDK Integration Example
from Hyper Auth import Hyper Auth

app = Hyper Auth(
    app_id="YOUR_APP_ID",
    secret="YOUR_APP_SECRET",
    version="1.0"
)

# Connect & get temp encryption session
if not app.init():
    print("[-] Handshake validation error")
    exit(1)

username = input("Username: ")
password = input("Password: ")

if app.login(username, password):
    print("[+] Session authorized! Expires:", app.license_info["expiresAt"])
else:
    print("[-] Invalid login details")
`;

  return (
    <main className="relative min-h-screen text-slate-100 pb-20">
      <ParticleBg />
      <Navigation />

      <section className="relative z-10 pt-36 px-6 max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Documentation</span>
          
          <button
            onClick={() => setActiveTab("api")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 text-left ${
              activeTab === "api"
                ? "bg-red-600/10 border border-red-500/30 text-red-400"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Server className="h-4 w-4" /> REST API Endpoints
          </button>
          
          <button
            onClick={() => setActiveTab("sdk")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 text-left ${
              activeTab === "sdk"
                ? "bg-red-600/10 border border-red-500/30 text-red-400"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Code className="h-4 w-4" /> Multi-Language SDKs
          </button>
        </aside>

        {/* Content Panel */}
        <div className="flex-1">
          {activeTab === "api" ? (
            <GlowCard glowColor="red">
              <h2 className="text-xl font-bold font-outfit mb-2 flex items-center gap-2">
                <Terminal className="h-5 w-5 text-red-400" /> API Reference Guide
              </h2>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Connect external scripts or custom binaries straight to our secure endpoints. 
                All API communications requires signature validations.
              </p>

              <div className="flex flex-col gap-6">
                <div className="border-b border-white/5 pb-4">
                  <span className="inline-block bg-red-600/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-bold mb-2">
                    POST
                  </span>
                  <h4 className="text-sm font-bold font-mono">/api/client/handshake</h4>
                  <p className="text-xs text-slate-400 mt-1 mb-2">Request dynamic encryption key for requests.</p>
                  <div className="bg-slate-950 p-3 rounded-lg font-mono text-[10px] text-slate-400">
                    {"{ \"appId\": \"your-application-uuid\" }"}
                  </div>
                </div>

                <div className="border-b border-white/5 pb-4">
                  <span className="inline-block bg-red-600/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-bold mb-2">
                    POST
                  </span>
                  <h4 className="text-sm font-bold font-mono">/api/client/login</h4>
                  <p className="text-xs text-slate-400 mt-1 mb-2">Authenticate client account and lock HWID.</p>
                  <div className="bg-slate-950 p-3 rounded-lg font-mono text-[10px] text-slate-400">
                    {"{ \"appId\": \"uuid\", \"payload\": \"encrypted_aes_payload\" }"}
                  </div>
                </div>

                <div>
                  <span className="inline-block bg-red-600/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-bold mb-2">
                    POST
                  </span>
                  <h4 className="text-sm font-bold font-mono">/api/client/validate</h4>
                  <p className="text-xs text-slate-400 mt-1 mb-2">Validate if client license key is still valid.</p>
                </div>
              </div>
            </GlowCard>
          ) : (
            <GlowCard glowColor="red">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold font-outfit mb-2 flex items-center gap-2">
                    <Code className="h-5 w-5 text-red-400" /> SDK Integrations & Boilerplate
                  </h2>
                  <p className="text-xs text-slate-400">
                    Deploy licensing checks inside your target binaries with our boilerplate routines.
                  </p>
                </div>
                <a 
                  href="/sdk/cpp-sdk.tar.gz" 
                  download
                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] flex items-center gap-2"
                >
                  <Code className="w-4 h-4" /> Download C++ SDK
                </a>
              </div>

              <div className="flex flex-col gap-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-300 mb-2 font-mono">C++ Integration Example</h4>
                  <pre className="bg-slate-950 p-4 rounded-lg font-mono text-[10px] text-slate-300 overflow-x-auto">
                    {cppExample}
                  </pre>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-300 mb-2 font-mono">Python Integration Example</h4>
                  <pre className="bg-slate-950 p-4 rounded-lg font-mono text-[10px] text-slate-300 overflow-x-auto">
                    {pythonExample}
                  </pre>
                </div>
              </div>
            </GlowCard>
          )}
        </div>
      </section>
    </main>
  );
}
