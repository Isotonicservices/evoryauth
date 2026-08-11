"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { GlowCard } from "@/components/glow-card";
import {
  Users, ShieldAlert, Fingerprint, ShieldCheck, ShieldX,
  Trash2, Search, RefreshCw, Key, Ban, Plus, X, Globe,
  User, ChevronDown, Check, Copy, AlertTriangle
} from "lucide-react";

interface LicenseInfo {
  key: string;
  label: string | null;
  duration: string;
  expiresAt: string | null;
  status: string;
  hwid: string | null;
  hwidLock: boolean;
}

interface ClientUser {
  id: string;
  username: string;
  hwid: string | null;
  ip: string | null;
  lastLogin: string;
  createdAt: string;
  licenseId: string;
  license: LicenseInfo;
}

interface BlacklistRecord {
  id: string;
  hwid: string;
  reason: string | null;
  createdAt: string;
}

export default function AppUsersManager() {
  const [apps, setApps] = useState<{ id: string; name: string }[]>([]);
  const [selectedApp, setSelectedApp] = useState("");
  const [clientUsers, setClientUsers] = useState<ClientUser[]>([]);
  const [blacklist, setBlacklist] = useState<BlacklistRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "blacklist">("users");

  // Modal / Form states
  const [banModalUser, setBanModalUser] = useState<ClientUser | null>(null);
  const [banReason, setBanReason] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [manualReason, setManualReason] = useState("");
  const [showManualBlacklist, setShowManualBlacklist] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch applications on mount
  useEffect(() => {
    fetch("/api/apps")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.apps.length > 0) {
          setApps(d.apps);
          setSelectedApp(d.apps[0].id);
        }
      })
      .catch(console.error);
  }, []);

  // Fetch client users and blacklist records for selected app
  const fetchData = useCallback(async () => {
    if (!selectedApp) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/client-users?appId=${selectedApp}`);
      const data = await res.json();
      if (data.success) {
        setClientUsers(data.clientUsers || []);
        setBlacklist(data.blacklist || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedApp]);

  useEffect(() => {
    fetchData();
  }, [fetchData, selectedApp]);

  // Copy helper
  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Reset HWID binding
  const handleResetHwid = async (user: ClientUser) => {
    if (!confirm(`Are you sure you want to reset HWID binding for user "${user.username}"?`)) return;
    try {
      const res = await fetch(`/api/client-users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetHwid: true }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh local data
        setClientUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, hwid: null, license: { ...u.license, hwid: null } } : u
          )
        );
      } else {
        alert(data.error || "Failed to reset HWID");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Blacklist HWID
  const handleBlacklistUser = async () => {
    if (!banModalUser) return;
    const hwid = banModalUser.hwid || banModalUser.license.hwid;
    if (!hwid) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/client-users/${banModalUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blacklistHwid: true, reason: banReason }),
      });
      const data = await res.json();
      if (data.success) {
        // Add to local blacklist list and refresh
        setBanModalUser(null);
        setBanReason("");
        fetchData();
      } else {
        alert(data.error || "Failed to blacklist HWID");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // Remove HWID from blacklist (Unban)
  const handleRemoveFromBlacklist = async (record: BlacklistRecord) => {
    if (!confirm("Are you sure you want to remove this HWID from the blacklist?")) return;
    try {
      const res = await fetch(`/api/blacklist/${record.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setBlacklist((prev) => prev.filter((r) => r.id !== record.id));
      } else {
        alert(data.error || "Failed to remove from blacklist");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Manually add key to blacklist and ban it
  const handleAddManualBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualKey || !selectedApp) return;
    setSaving(true);
    try {
      const res = await fetch("/api/blacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: manualKey, reason: manualReason, appId: selectedApp }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.message) {
          alert(data.message);
        }
        setManualKey("");
        setManualReason("");
        setShowManualBlacklist(false);
        fetchData();
      } else {
        alert(data.error || "Failed to ban & blacklist license key");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // Delete user account
  const handleDeleteUser = async (user: ClientUser) => {
    if (!confirm(`Are you sure you want to permanently delete user "${user.username}"? This will delete their credentials but not the license key itself.`)) return;
    try {
      const res = await fetch(`/api/client-users/${user.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setClientUsers((prev) => prev.filter((u) => u.id !== user.id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filtering users
  const filteredUsers = clientUsers.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      (u.hwid && u.hwid.toLowerCase().includes(q)) ||
      (u.ip && u.ip.toLowerCase().includes(q)) ||
      u.license.key.toLowerCase().includes(q)
    );
  });

  // Check if a client user is blacklisted (if their HWID is in the blacklist)
  const isUserBlacklisted = (user: ClientUser) => {
    const hwid = user.hwid || user.license.hwid;
    if (!hwid) return false;
    return blacklist.some((b) => b.hwid === hwid);
  };

  return (
    <div className="min-h-screen bg-[#020106] text-slate-100 flex">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold font-outfit flex items-center gap-2">
                <Users className="h-6 w-6 text-red-400" /> App Users Manager
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                View and manage client registrations, login activities, HWID bindings, and blacklists.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">App:</span>
              <div className="relative">
                <select
                  value={selectedApp}
                  onChange={(e) => setSelectedApp(e.target.value)}
                  className="appearance-none bg-slate-900 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-xs font-semibold focus:outline-none focus:border-purple-500"
                >
                  {apps.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-3 w-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <button
                onClick={fetchData}
                className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Stats Summary Card */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "Registered Users",
                value: clientUsers.length,
                icon: <User className="h-4 w-4 text-red-400" />,
                color: "red",
                glow: "red",
              },
              {
                label: "Active HWID Locks",
                value: clientUsers.filter((u) => u.hwid || u.license.hwid).length,
                icon: <Fingerprint className="h-4 w-4 text-orange-400" />,
                color: "orange",
                glow: "red",
              },
              {
                label: "Blacklisted Devices",
                value: blacklist.length,
                icon: <ShieldAlert className="h-4 w-4 text-red-400" />,
                color: "red",
                glow: "red",
              },
              {
                label: "Banned App Users",
                value: clientUsers.filter(isUserBlacklisted).length,
                icon: <Ban className="h-4 w-4 text-red-400" />,
                color: "red",
                glow: "red",
              },
            ].map((s) => (
              <GlowCard
                key={s.label}
                glowColor={s.glow as "red" | "none"}
                className="flex items-center gap-3 p-4"
              >
                <div className={`p-2 rounded-lg bg-${s.color}-500/10`}>{s.icon}</div>
                <div>
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-[10px] text-slate-500">{s.label}</p>
                </div>
              </GlowCard>
            ))}
          </div>

          {/* Manual blacklist creation card */}
          {showManualBlacklist ? (
            <GlowCard glowColor="red" className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2 text-red-400">
                  <ShieldAlert className="h-4 w-4" /> Manually Blacklist by License Key
                </h3>
                <button
                  onClick={() => setShowManualBlacklist(false)}
                  className="text-slate-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleAddManualBlacklist} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      License Key
                    </label>
                    <input
                      type="text"
                      required
                      value={manualKey}
                      onChange={(e) => setManualKey(e.target.value)}
                      placeholder="e.g. SECURE-A1B2-C3D4-E5F6..."
                      className="bg-slate-900/80 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500 font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      Ban Reason
                    </label>
                    <input
                      type="text"
                      value={manualReason}
                      onChange={(e) => setManualReason(e.target.value)}
                      placeholder="e.g. Account sharing, charging back, loader crack attempt"
                      className="bg-slate-900/80 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowManualBlacklist(false)}
                    className="px-4 py-2 border border-white/10 rounded-lg text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-600/30 transition-colors"
                  >
                    {saving ? "Banning..." : "Ban & Blacklist Key"}
                  </button>
                </div>
              </form>
            </GlowCard>
          ) : (
            <div className="flex justify-between items-center mb-6">
              {/* Tab Navigation */}
              <div className="flex border-b border-white/5 w-fit">
                <button
                  onClick={() => setActiveTab("users")}
                  className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
                    activeTab === "users"
                      ? "border-purple-500 text-purple-400"
                      : "border-transparent text-slate-500 hover:text-white"
                  }`}
                >
                  App Users ({clientUsers.length})
                </button>
                <button
                  onClick={() => setActiveTab("blacklist")}
                  className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
                    activeTab === "blacklist"
                      ? "border-red-500 text-red-400"
                      : "border-transparent text-slate-500 hover:text-white"
                  }`}
                >
                  HWID Blacklist ({blacklist.length})
                </button>
              </div>

              {/* Add Blacklist button */}
              <button
                onClick={() => setShowManualBlacklist(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-600/10 border border-red-500/20 text-red-400 hover:bg-red-600/20 text-xs font-semibold rounded-lg transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Blacklist by Key
              </button>
            </div>
          )}

          {/* Search box for users */}
          {activeTab === "users" && (
            <div className="mb-4 relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search app users by username, HWID, IP or license key..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-purple-500/50 placeholder-slate-600"
              />
            </div>
          )}

          {/* Data Tables */}
          <GlowCard glowColor={activeTab === "users" ? "red" : "none"}>
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 py-12 justify-center">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Loading data...
              </div>
            ) : activeTab === "users" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-3 pr-4">User</th>
                      <th className="pr-4">License Key</th>
                      <th className="pr-4">HWID Lock</th>
                      <th className="pr-4">Last Login IP</th>
                      <th className="pr-4">Last Login</th>
                      <th className="pr-4">Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const userHwid = user.hwid || user.license.hwid;
                      const blacklisted = isUserBlacklisted(user);

                      return (
                        <tr
                          key={user.id}
                          className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                        >
                          {/* Username */}
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-purple-900/30 border border-purple-500/20 flex items-center justify-center text-[10px] font-bold shrink-0 text-purple-300">
                                {user.username[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-white">{user.username}</p>
                                <p className="text-[9px] text-slate-500">
                                  Registered: {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* License Key */}
                          <td className="pr-4">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs font-semibold text-white">
                                  {user.license.key}
                                </span>
                                <button
                                  onClick={() => handleCopy(user.license.key, user.id)}
                                  className="text-slate-600 hover:text-blue-400 transition-colors"
                                >
                                  {copiedId === user.id ? (
                                    <Check className="h-3 w-3 text-green-400" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
                              {user.license.label && (
                                <span className="text-[9px] text-purple-400">
                                  Label: {user.license.label}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* HWID lock */}
                          <td className="pr-4">
                            {userHwid ? (
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5">
                                  <Fingerprint className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                                  <span
                                    className="font-mono text-[10px] text-orange-300 max-w-[120px] truncate"
                                    title={userHwid}
                                  >
                                    {userHwid}
                                  </span>
                                  <button
                                    onClick={() => handleCopy(userHwid, `${user.id}-hwid`)}
                                    className="text-slate-600 hover:text-blue-400 transition-colors shrink-0"
                                  >
                                    {copiedId === `${user.id}-hwid` ? (
                                      <Check className="h-3 w-3 text-green-400" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </button>
                                </div>
                                <button
                                  onClick={() => handleResetHwid(user)}
                                  className="w-fit text-[9px] px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 font-semibold"
                                >
                                  Reset HWID
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-600 text-[10px]">Unbound / None</span>
                            )}
                          </td>

                          {/* IP */}
                          <td className="pr-4 text-slate-400">
                            {user.ip ? (
                              <span className="font-mono text-[11px] flex items-center gap-1">
                                <Globe className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                {user.ip}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>

                          {/* Last Login Time */}
                          <td className="pr-4 text-slate-400 text-[11px]">
                            {new Date(user.lastLogin).toLocaleString()}
                          </td>

                          {/* Status */}
                          <td className="pr-4">
                            {blacklisted ? (
                              <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit">
                                <Ban className="h-3 w-3" /> Blacklisted
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit">
                                <ShieldCheck className="h-3 w-3" /> Active
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td>
                            <div className="flex items-center gap-2">
                              {!blacklisted && userHwid && (
                                <button
                                  onClick={() => setBanModalUser(user)}
                                  className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  title="Ban HWID"
                                >
                                  <Ban className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Delete user account"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center text-slate-600 py-12">
                          <Users className="h-8 w-8 mx-auto mb-3 opacity-30" />
                          <p>{search ? "No matches found." : "No registered client users yet."}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-3 pr-4">Hardware ID (HWID)</th>
                      <th className="pr-4">Ban Reason</th>
                      <th className="pr-4">Blacklisted At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blacklist.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        {/* HWID */}
                        <td className="py-3 pr-4 font-mono text-xs text-white">
                          <div className="flex items-center gap-1.5">
                            <Fingerprint className="h-3.5 w-3.5 text-red-400 shrink-0" />
                            <span>{record.hwid}</span>
                            <button
                              onClick={() => handleCopy(record.hwid, record.id)}
                              className="text-slate-600 hover:text-blue-400 transition-colors shrink-0"
                            >
                              {copiedId === record.id ? (
                                <Check className="h-3 w-3 text-green-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Ban Reason */}
                        <td className="pr-4 text-slate-300 font-semibold max-w-sm truncate">
                          {record.reason || "Banned by developer"}
                        </td>

                        {/* Blacklisted date */}
                        <td className="pr-4 text-slate-400 text-[11px]">
                          {new Date(record.createdAt).toLocaleString()}
                        </td>

                        {/* Actions */}
                        <td>
                          <button
                            onClick={() => handleRemoveFromBlacklist(record)}
                            className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-semibold rounded hover:bg-green-500/20 transition-colors"
                          >
                            Unban HWID
                          </button>
                        </td>
                      </tr>
                    ))}

                    {blacklist.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center text-slate-600 py-12">
                          <ShieldCheck className="h-8 w-8 mx-auto mb-3 opacity-30 text-green-500" />
                          <p>No blacklisted devices found for this application.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </GlowCard>
        </div>
      </main>

      {/* Ban reason modal */}
      {banModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0d0d1a] border border-red-500/30 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="font-bold text-sm text-white">Blacklist HWID</h3>
              <button
                onClick={() => setBanModalUser(null)}
                className="ml-auto text-slate-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Are you sure you want to ban the machine HWID of user{" "}
              <strong className="text-white">"{banModalUser.username}"</strong>?
              This will block this device from logging in, registering, or activating any license key
              associated with your apps.
            </p>
            <div className="space-y-1 mb-4">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                Machine HWID
              </p>
              <p className="font-mono text-[10px] text-red-300 bg-red-500/5 border border-red-500/20 rounded-lg p-2 break-all">
                {banModalUser.hwid || banModalUser.license.hwid}
              </p>
            </div>
            <div className="space-y-1.5 mb-6">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                Reason for Ban
              </label>
              <input
                type="text"
                autoFocus
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="e.g. Chargeback, reverse engineering attempt..."
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setBanModalUser(null)}
                className="flex-1 py-2 rounded-lg border border-white/10 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleBlacklistUser}
                disabled={saving}
                className="flex-1 py-2 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-600/30 transition-colors"
              >
                {saving ? "Banning..." : "Confirm Ban"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
