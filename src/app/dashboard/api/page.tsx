"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { GlowCard } from "@/components/glow-card";
import {
  Code2, Copy, Check, Key, Shield, Fingerprint, LogIn,
  UserPlus, RefreshCw, ChevronDown, Zap, Globe
} from "lucide-react";

function CodeBlock({ code, lang = "javascript" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-xl overflow-hidden border border-white/5">
      <div className="flex items-center justify-between bg-slate-900/80 px-4 py-2 border-b border-white/5">
        <span className="text-[10px] text-slate-500 uppercase font-bold">{lang}</span>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-white transition-colors">
          {copied ? <><Check className="h-3 w-3 text-green-400" /><span className="text-green-400">Copied!</span></> : <><Copy className="h-3 w-3" />Copy</>}
        </button>
      </div>
      <pre className="bg-[#0a0a14] text-[11px] text-slate-300 p-4 overflow-x-auto leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Badge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-green-500/10 border-green-500/30 text-green-400",
    POST: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    PATCH: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    DELETE: "bg-red-500/10 border-red-500/30 text-red-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${colors[method] || ""}`}>
      {method}
    </span>
  );
}

function Endpoint({ method, path, desc, params, response, code, lang }: {
  method: string; path: string; desc: string;
  params?: { name: string; type: string; desc: string; required?: boolean }[];
  response?: string; code?: string; lang?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/5 rounded-xl overflow-hidden mb-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors text-left"
      >
        <Badge method={method} />
        <code className="text-[11px] font-mono text-blue-300">{path}</code>
        <span className="text-xs text-slate-500 ml-2 flex-1">{desc}</span>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-white/5 p-4 space-y-4 bg-slate-950/30">
          {params && params.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Parameters</p>
              <table className="w-full text-xs text-left">
                <thead><tr className="text-[10px] text-slate-600 uppercase border-b border-white/5">
                  <th className="py-1.5 pr-4">Name</th><th className="pr-4">Type</th><th className="pr-4">Required</th><th>Description</th>
                </tr></thead>
                <tbody>
                  {params.map(p => (
                    <tr key={p.name} className="border-b border-white/5">
                      <td className="py-1.5 pr-4 font-mono text-blue-300">{p.name}</td>
                      <td className="pr-4 text-slate-400">{p.type}</td>
                      <td className="pr-4">{p.required ? <span className="text-red-400">required</span> : <span className="text-slate-600">optional</span>}</td>
                      <td className="text-slate-400">{p.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {response && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Response</p>
              <CodeBlock code={response} lang="json" />
            </div>
          )}
          {code && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Example</p>
              <CodeBlock code={code} lang={lang} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ApiDocsPage() {
  const [appId, setAppId] = useState("YOUR_APP_ID");
  const [appSecret, setAppSecret] = useState("YOUR_APP_SECRET");
  const [ownerId, setOwnerId] = useState("YOUR_OWNER_ID");
  const [appName, setAppName] = useState("YOUR_APP_NAME");
  const [appVersion, setAppVersion] = useState("1.0");
  const [apps, setApps] = useState<{ id: string; name: string; secret: string; userId: string; version: string }[]>([]);
  const [displaySnippet, setDisplaySnippet] = useState(false);
  const [refreshingSecret, setRefreshingSecret] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRefreshSecret = async () => {
    if (!appId || appId === "YOUR_APP_ID") return;
    if (!confirm("Are you sure you want to refresh the application secret? This will invalidate any loaders using the old secret!")) return;
    setRefreshingSecret(true);
    try {
      const res = await fetch(`/api/apps/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetSecret: true })
      });
      const data = await res.json();
      if (data.success) {
        setAppSecret(data.app.secret);
        setApps(prev => prev.map(a => a.id === appId ? { ...a, secret: data.app.secret } : a));
      } else {
        alert(data.error || "Failed to reset secret");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshingSecret(false);
    }
  };

  useEffect(() => {
    fetch("/api/apps").then(r => r.json()).then(d => {
      if (d.success && d.apps.length > 0) {
        setApps(d.apps);
        setAppId(d.apps[0].id);
        setAppSecret(d.apps[0].secret);
        setOwnerId(d.apps[0].userId);
        setAppName(d.apps[0].name);
        setAppVersion(d.apps[0].version || "1.0");
      }
    }).catch(() => {});
  }, []);
  const clientUrl = typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? `${window.location.origin}/api/client`
    : "https://Hyper Auth.online/api/client";

  const cppCode = `#include <iostream>
#include <Windows.h>
#include <vector>
#include "auth.hpp"

using namespace KeyAuth;

std::string name = "${appName}";
std::string ownerid = "${ownerId}";
std::string secret = "${appSecret}";
std::string version = "${appVersion}";
std::string url = "${clientUrl}";
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

  const SDKcode = `// Hyper Auth JavaScript SDK
// Install: npm install axios

const Hyper Auth = {
  baseUrl: "${baseUrl}/api/client",
  appId: "${appId}",
  appSecret: "${appSecret}",

  // Authenticate a user license
  async authenticate(licenseKey, hwid) {
    const res = await fetch(\`\${this.baseUrl}/authenticate\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appId: this.appId,
        appSecret: this.appSecret,
        licenseKey,
        hwid,  // pass navigator.userAgent or a unique machine ID
      }),
    });
    return res.json();
  },

  // Register a client user
  async register(licenseKey, username, password, hwid) {
    const res = await fetch(\`\${this.baseUrl}/register\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appId: this.appId,
        appSecret: this.appSecret,
        licenseKey,
        username,
        password,
        hwid,
      }),
    });
    return res.json();
  },

  // Login a client user
  async login(username, password, hwid) {
    const res = await fetch(\`\${this.baseUrl}/login\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appId: this.appId,
        appSecret: this.appSecret,
        username,
        password,
        hwid,
      }),
    });
    return res.json();
  },
};

// Usage:
const result = await Hyper Auth.authenticate("Secure-XXXX-YYYY-ZZZZ-WWWW", getHWID());
if (result.success) {
  console.log("✅ License valid!", result.user);
} else {
  console.error("❌", result.error);
}`;

  const csharpCode = `// C# / .NET SDK Example
using System.Net.Http;
using System.Text.Json;

public class Hyper Auth
{
    private static readonly HttpClient http = new HttpClient();
    private const string BaseUrl = "${baseUrl}/api/client";
    private const string AppId = "${appId}";
    private const string AppSecret = "${appSecret}";

    public static async Task<JsonElement> Authenticate(string licenseKey, string hwid)
    {
        var payload = new { appId = AppId, appSecret = AppSecret, licenseKey, hwid };
        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

        var response = await http.PostAsync($"{BaseUrl}/authenticate", content);
        var body = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<JsonElement>(body);
    }
}

// Usage:
var result = await HyperAuth.Authenticate("Secure-XXXX-YYYY-ZZZZ-WWWW", GetHWID());`;

  const pythonCode = `# Python SDK Example
import requests
import hashlib, platform

BASE_URL = "${baseUrl}/api/client"
APP_ID   = "${appId}"
APP_SECRET = "${appSecret}"

def get_hwid():
    raw = platform.node() + platform.processor()
    return hashlib.sha256(raw.encode()).hexdigest()

def authenticate(license_key: str) -> dict:
    r = requests.post(f"{BASE_URL}/authenticate", json={
        "appId": APP_ID,
        "appSecret": APP_SECRET,
        "licenseKey": license_key,
        "hwid": get_hwid(),
    })
    return r.json()

# Usage
result = authenticate("Secure-XXXX-YYYY-ZZZZ-WWWW")
if result.get("success"):
    print("✅ Valid:", result["user"])
else:
    print("❌", result["error"])`;

  return (
    <div className="min-h-screen bg-[#020106] text-slate-100 flex">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-2xl font-bold font-outfit flex items-center gap-2 mb-2">
              <Code2 className="h-6 w-6 text-blue-400" /> API Reference
            </h1>
            <p className="text-xs text-slate-500">
              Integrate Hyper Auth into your application using our REST API. Base URL:{" "}
              <code className="text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded font-mono">{baseUrl}</code>
            </p>
          </div>

          {/* App selector */}
          {apps.length > 0 && (
            <GlowCard glowColor="red" className="mb-8">
              <div className="flex items-center gap-3 flex-wrap">
                <Zap className="h-4 w-4 text-blue-400 shrink-0" />
                <span className="text-xs font-bold">Quick Fill — Select your app to auto-fill examples:</span>
                <select
                  onChange={e => {
                    const app = apps.find(a => a.id === e.target.value);
                    if (app) {
                      setAppId(app.id);
                      setAppSecret(app.secret);
                      setOwnerId(app.userId);
                      setAppName(app.name);
                      setAppVersion(app.version || "1.0");
                    }
                  }}
                  className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                >
                  {apps.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span>App ID:</span>
                  <code className="text-blue-300 font-mono">{appId.substring(0, 8)}…</code>
                </div>
              </div>
            </GlowCard>
          )}

          {/* Application Credentials Card */}
          {appId && appId !== "YOUR_APP_ID" && (
            <GlowCard glowColor="red" className="mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-sm font-bold text-white">Application Credentials</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Simply replace the placeholder code in the example with these</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={displaySnippet}
                      onChange={(e) => setDisplaySnippet(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600 peer-checked:after:bg-white"></div>
                    <span className="ml-2 text-[10px] font-semibold text-slate-400">Display Code Snippet</span>
                  </label>
                </div>
              </div>

              {displaySnippet ? (
                <div className="bg-[#080812] border border-white/5 rounded-xl p-4 font-mono text-[10px] text-purple-300 space-y-1 relative group select-all">
                  <button
                    onClick={() => {
                      const snippet = `std::string name = "${appName}";\nstd::string ownerid = "${ownerId}";\nstd::string secret = "${appSecret}";\nstd::string version = "${appVersion}";\nstd::string url = "${clientUrl}";\nstd::string path = "";`;
                      handleCopy(snippet, "cpp-snippet");
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Copy snippet"
                  >
                    {copiedId === "cpp-snippet" ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <p><span className="text-blue-400">std::string</span> name = <span className="text-green-400">"{appName}"</span>;</p>
                  <p><span className="text-blue-400">std::string</span> ownerid = <span className="text-green-400">"{ownerId}"</span>;</p>
                  <p><span className="text-blue-400">std::string</span> secret = <span className="text-green-400">"{appSecret}"</span>;</p>
                  <p><span className="text-blue-400">std::string</span> version = <span className="text-green-400">"{appVersion}"</span>;</p>
                  <p><span className="text-blue-400">std::string</span> url = <span className="text-green-400">"{clientUrl}"</span>;</p>
                  <p><span className="text-blue-400">std::string</span> path = <span className="text-green-400">""</span>;</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { label: "APPLICATION NAME", value: appName, id: "appName" },
                    { label: "ACCOUNT OWNER ID", value: ownerId, id: "ownerId" },
                    { label: "APPLICATION SECRET", value: appSecret, id: "appSecret", isSecret: true },
                    { label: "APPLICATION VERSION", value: appVersion, id: "appVersion" }
                  ].map((field) => (
                    <div key={field.label} className="bg-[#080812] border border-white/5 rounded-xl p-3.5 flex justify-between items-center relative">
                      <div className="min-w-0 flex-1 mr-4">
                        <p className="font-mono text-xs text-white break-all select-all">{field.value}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(field.value, field.id)}
                        className="text-slate-500 hover:text-white p-1.5 rounded bg-slate-900 border border-white/10 transition-colors shrink-0"
                      >
                        {copiedId === field.id ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={handleRefreshSecret}
                  disabled={refreshingSecret}
                  className="bg-amber-600/10 border border-amber-500/30 hover:bg-amber-600/20 text-amber-400 font-semibold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${refreshingSecret ? "animate-spin" : ""}`} />
                  Refresh Application Secret
                </button>
              </div>
            </GlowCard>
          )}

          {/* Auth header note */}
          <GlowCard glowColor="red" className="mb-8">
            <div className="flex items-start gap-3">
              <Shield className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white mb-1">Authentication</p>
                <p className="text-xs text-slate-400">
                  All client API calls require <code className="text-blue-300 font-mono">appId</code> and{" "}
                  <code className="text-blue-300 font-mono">appSecret</code> in the request body.
                  Dashboard APIs require an active session cookie (<code className="text-blue-300 font-mono">Secure_token</code>).
                </p>
              </div>
            </div>
          </GlowCard>

          {/* ── Client API section ── */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-4 w-4 text-green-400" />
              <h2 className="text-sm font-bold text-white">Client API</h2>
              <span className="text-[10px] text-slate-500">— embed in your application</span>
            </div>

            <Endpoint
              method="POST"
              path="/api/client/authenticate"
              desc="Validate a license key and bind HWID"
              params={[
                { name: "appId", type: "string", desc: "Your application ID", required: true },
                { name: "appSecret", type: "string", desc: "Your application secret key", required: true },
                { name: "licenseKey", type: "string", desc: "The license key to validate (Secure-XXXX-...)", required: true },
                { name: "hwid", type: "string", desc: "Hardware ID of the client machine", required: false },
              ]}
              response={`{
  "success": true,
  "message": "License validated successfully.",
  "license": {
    "key": "Secure-XXXX-YYYY-ZZZZ-WWWW",
    "duration": "30d",
    "status": "ACTIVE",
    "hwid": "abc123...",
    "expiresAt": "2025-06-24T00:00:00.000Z"
  }
}`}
              code={`const response = await fetch("${baseUrl}/api/client/authenticate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    appId: "${appId}",
    appSecret: "${appSecret}",
    licenseKey: "Secure-XXXX-YYYY-ZZZZ-WWWW",
    hwid: navigator.userAgent,  // or a machine-specific ID
  }),
});

const data = await response.json();
if (data.success) {
  console.log("✅ License valid");
} else {
  console.error("❌", data.error);
}`}
            />

            <Endpoint
              method="POST"
              path="/api/client/register"
              desc="Register a client user (requires valid license key)"
              params={[
                { name: "appId", type: "string", desc: "Your application ID", required: true },
                { name: "appSecret", type: "string", desc: "Your application secret", required: true },
                { name: "licenseKey", type: "string", desc: "Valid license key to bind this account", required: true },
                { name: "username", type: "string", desc: "Username for the client user", required: true },
                { name: "password", type: "string", desc: "Password (will be hashed)", required: true },
                { name: "hwid", type: "string", desc: "Hardware ID to bind to this user", required: false },
              ]}
              response={`{
  "success": true,
  "message": "User registered successfully.",
  "user": {
    "id": "abc...",
    "username": "johndoe",
    "hwid": "abc123..."
  }
}`}
              code={`const response = await fetch("${baseUrl}/api/client/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    appId: "${appId}",
    appSecret: "${appSecret}",
    licenseKey: "Secure-XXXX-YYYY-ZZZZ-WWWW",
    username: "johndoe",
    password: "securepassword",
    hwid: getMachineId(),
  }),
});`}
            />

            <Endpoint
              method="POST"
              path="/api/client/login"
              desc="Authenticate a registered client user"
              params={[
                { name: "appId", type: "string", desc: "Your application ID", required: true },
                { name: "appSecret", type: "string", desc: "Your application secret", required: true },
                { name: "username", type: "string", desc: "Client username", required: true },
                { name: "password", type: "string", desc: "Client password", required: true },
                { name: "hwid", type: "string", desc: "Machine HWID to validate binding", required: false },
              ]}
              response={`{
  "success": true,
  "message": "Login successful.",
  "user": {
    "id": "...",
    "username": "johndoe",
    "hwid": "abc123...",
    "lastLogin": "2025-05-25T20:00:00.000Z"
  }
}`}
            />
          </section>

          {/* ── Dashboard API section ── */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Key className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white">Dashboard API</h2>
              <span className="text-[10px] text-slate-500">— manage licenses from your backend</span>
            </div>

            <Endpoint
              method="GET"
              path="/api/licenses?appId=YOUR_APP_ID"
              desc="List all license keys for an application"
              params={[
                { name: "appId", type: "query string", desc: "The application ID to fetch licenses for", required: true },
              ]}
              response={`{
  "success": true,
  "licenses": [
    {
      "id": "...",
      "key": "Secure-XXXX-YYYY-ZZZZ-WWWW",
      "duration": "30d",
      "status": "ACTIVE",
      "hwid": null,
      "activations": 0,
      "expiresAt": null
    }
  ]
}`}
            />

            <Endpoint
              method="POST"
              path="/api/licenses"
              desc="Bulk generate new license keys"
              params={[
                { name: "appId", type: "string", desc: "Target application ID", required: true },
                { name: "duration", type: "string", desc: "1d | 7d | 30d | 90d | lifetime", required: false },
                { name: "amount", type: "number", desc: "Number of keys to generate (max 100)", required: false },
                { name: "hwidLock", type: "boolean", desc: "Whether to enable HWID binding (default: true)", required: false },
              ]}
              response={`{
  "success": true,
  "licenses": [
    { "id": "...", "key": "Secure-XXXX-YYYY-ZZZZ-WWWW", "duration": "30d", "status": "ACTIVE" }
  ]
}`}
            />

            <Endpoint
              method="PATCH"
              path="/api/licenses/:id"
              desc="Reset HWID binding or update license status"
              params={[
                { name: "resetHwid", type: "boolean", desc: "Set true to clear HWID binding", required: false },
                { name: "status", type: "string", desc: "ACTIVE | PAUSED | BANNED", required: false },
                { name: "banReason", type: "string", desc: "Reason for ban (used when status=BANNED)", required: false },
              ]}
            />

            <Endpoint
              method="DELETE"
              path="/api/licenses/:id"
              desc="Permanently delete a license key"
              response={`{ "success": true, "message": "License deleted" }`}
            />
          </section>

          {/* ── Integration Guide ── */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-yellow-400" />
              <h2 className="text-sm font-bold text-white">How to Integrate in Your Loader/Project</h2>
            </div>
            
            <GlowCard glowColor="red">
              <div className="space-y-4 text-sm text-slate-300">
                <p>Follow these steps to integrate Hyper Auth into your custom loader or application:</p>
                <ol className="list-decimal pl-5 space-y-3">
                  <li>
                    <strong className="text-white">Copy your Application Credentials:</strong> Choose your application from the dropdown above, check "Display Code Snippet", and copy the C++ or C# variables into your source code.
                  </li>
                  <li>
                    <strong className="text-white">Import the SDK / Setup Requests:</strong> Use our provided SDK boilerplates below. If you're building a C++ loader, you can use raw WinINet, cURL, or cpr to make a POST request to <code className="text-blue-300 bg-blue-500/10 px-1 rounded font-mono">/api/client/authenticate</code>.
                  </li>
                  <li>
                    <strong className="text-white">Send License Key & HWID:</strong> Capture the user's license key via a console input or GUI textbox. Collect their hardware ID (using CPU/Disk serials) and send them in the JSON payload.
                  </li>
                  <li>
                    <strong className="text-white">Handle the Response:</strong> Parse the JSON response. If <code className="text-blue-300 bg-blue-500/10 px-1 rounded font-mono">success: true</code>, allow the loader to inject or download the payload. If false, display the error and exit.
                  </li>
                </ol>
                <p className="pt-2 text-xs text-slate-500 border-t border-white/5">
                  <em>Tip: For C++ loaders, we highly recommend using <code className="text-blue-300 bg-blue-500/10 px-1 rounded font-mono">skCrypt</code> to encrypt all your static strings (like the app secret and URLs) to prevent reverse engineers from dumping them from memory.</em>
                </p>
              </div>
            </GlowCard>
          </section>

          {/* ── SDK Examples ── */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="h-4 w-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white">SDK Examples</h2>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">C++ (Hyper Auth SDK)</p>
                  <a 
                    href="/sdk/cpp-sdk.tar.gz" 
                    download
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-[10px] font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Code2 className="w-3 h-3" /> Download C++ SDK
                  </a>
                </div>
                <CodeBlock code={cppCode} lang="cpp" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">JavaScript / Node.js</p>
                <CodeBlock code={SDKcode} lang="javascript" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">Python</p>
                <CodeBlock code={pythonCode} lang="python" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">C# / .NET</p>
                <CodeBlock code={csharpCode} lang="csharp" />
              </div>
            </div>
          </section>

          {/* Error codes */}
          <GlowCard glowColor="red">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-400" /> Error Codes
            </h3>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-[10px] text-slate-500 uppercase border-b border-white/5">
                  <th className="py-2 pr-4">HTTP Status</th>
                  <th className="pr-4">Code</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                {[
                  [200, "success: true", "Request completed successfully"],
                  [400, "Bad Request", "Missing or invalid parameters"],
                  [401, "Unauthorized", "Missing or invalid session / credentials"],
                  [403, "Forbidden", "Insufficient permissions"],
                  [404, "Not Found", "Resource not found or not owned by you"],
                  [429, "Rate Limited", "Too many requests — wait before retrying"],
                  [500, "Server Error", "Internal server error"],
                ].map(([code, name, desc]) => (
                  <tr key={String(code)} className="border-b border-white/5">
                    <td className="py-2 pr-4 font-mono text-blue-300">{code}</td>
                    <td className="pr-4 font-semibold text-white">{name}</td>
                    <td>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlowCard>

        </div>
      </main>
    </div>
  );
}
