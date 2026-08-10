"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { GlowCard } from "@/components/glow-card";
import {
  Users, ShieldCheck, ShieldX, Trash2, Crown,
  RefreshCw, Search, User, CheckCircle, XCircle,
  ChevronDown, Star
} from "lucide-react";

interface UserRow {
  id: string;
  username: string;
  email: string;
  role: string;
  plan: string;
  status: string;
  createdAt: string;
  _count: { applications: number };
}

const PLANS = ["FREE", "BASIC", "PRO", "ENTERPRISE"];
const ROLES = ["USER", "ADMIN"];

const planColors: Record<string, string> = {
  FREE: "text-slate-400 bg-slate-500/10 border-slate-500/20",
  BASIC: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  PRO: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  ENTERPRISE: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

const roleColors: Record<string, string> = {
  USER: "text-slate-400 bg-slate-500/10 border-slate-500/20",
  ADMIN: "text-red-400 bg-red-500/10 border-red-500/20",
};

export default function UsersManager() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ role?: string; plan?: string; status?: string }>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) setUsers(data.users);
      else setError(data.error || "Failed to load users");
    } catch {
      setError("Network error loading users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSave = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...editData } : u));
        setEditingId(null);
        setEditData({});
      }
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`Permanently delete user "${username}"? This will also delete all their applications and licenses.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (res.ok) setUsers(prev => prev.filter(u => u.id !== id));
    } catch { /* ignore */ }
  };

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "ADMIN").length,
    banned: users.filter(u => u.status === "BANNED").length,
    enterprise: users.filter(u => u.plan === "ENTERPRISE").length,
  };

  return (
    <div className="min-h-screen bg-[#020106] text-slate-100 flex">
      <Sidebar isAdmin />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold font-outfit flex items-center gap-2">
                <Users className="h-6 w-6 text-purple-400" /> User Management
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage platform users, roles, subscription plans and account status.
              </p>
            </div>
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-xs text-slate-400 hover:text-white hover:border-white/20 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Users", value: stats.total, icon: <User className="h-4 w-4 text-blue-400" />, color: "blue", glow: "blue" },
              { label: "Administrators", value: stats.admins, icon: <ShieldCheck className="h-4 w-4 text-red-400" />, color: "red", glow: "purple" },
              { label: "Banned", value: stats.banned, icon: <ShieldX className="h-4 w-4 text-yellow-400" />, color: "yellow", glow: "purple" },
              { label: "Enterprise", value: stats.enterprise, icon: <Crown className="h-4 w-4 text-amber-400" />, color: "amber", glow: "cyan" },
            ].map(s => (
              <GlowCard key={s.label} glowColor={s.glow as "blue" | "purple" | "cyan"} className="flex items-center gap-3 p-4">
                <div className={`p-2 rounded-lg bg-${s.color}-500/10`}>{s.icon}</div>
                <div>
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-[10px] text-slate-500">{s.label}</p>
                </div>
              </GlowCard>
            ))}
          </div>

          {/* Search */}
          <div className="mb-4 relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-purple-500/50 placeholder-slate-600"
            />
          </div>

          {/* Users Table */}
          <GlowCard glowColor="purple">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
                {error}
              </div>
            )}
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 py-12 justify-center">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Loading users...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-3 pr-4">User</th>
                      <th className="pr-4">Role</th>
                      <th className="pr-4">Plan</th>
                      <th className="pr-4">Apps</th>
                      <th className="pr-4">Status</th>
                      <th className="pr-4">Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(user => (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">

                        {/* User info */}
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {user.username[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{user.username}</p>
                              <p className="text-[10px] text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="pr-4">
                          {editingId === user.id ? (
                            <div className="relative">
                              <select
                                value={editData.role ?? user.role}
                                onChange={e => setEditData(p => ({ ...p, role: e.target.value }))}
                                className="appearance-none bg-slate-800 border border-white/10 rounded px-2 py-1 text-[10px] pr-5 focus:outline-none focus:border-purple-500"
                              >
                                {ROLES.map(r => <option key={r}>{r}</option>)}
                              </select>
                              <ChevronDown className="h-2.5 w-2.5 absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${roleColors[user.role] || roleColors.USER}`}>
                              {user.role}
                            </span>
                          )}
                        </td>

                        {/* Plan */}
                        <td className="pr-4">
                          {editingId === user.id ? (
                            <div className="relative">
                              <select
                                value={editData.plan ?? user.plan}
                                onChange={e => setEditData(p => ({ ...p, plan: e.target.value }))}
                                className="appearance-none bg-slate-800 border border-white/10 rounded px-2 py-1 text-[10px] pr-5 focus:outline-none focus:border-purple-500"
                              >
                                {PLANS.map(p => <option key={p}>{p}</option>)}
                              </select>
                              <ChevronDown className="h-2.5 w-2.5 absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${planColors[user.plan] || planColors.FREE} flex items-center gap-1 w-fit`}>
                              {user.plan === "ENTERPRISE" && <Star className="h-2.5 w-2.5" />}
                              {user.plan}
                            </span>
                          )}
                        </td>

                        {/* Apps count */}
                        <td className="pr-4 text-slate-400">
                          <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px]">
                            {user._count.applications}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="pr-4">
                          {editingId === user.id ? (
                            <div className="relative">
                              <select
                                value={editData.status ?? user.status}
                                onChange={e => setEditData(p => ({ ...p, status: e.target.value }))}
                                className="appearance-none bg-slate-800 border border-white/10 rounded px-2 py-1 text-[10px] pr-5 focus:outline-none focus:border-purple-500"
                              >
                                <option>ACTIVE</option>
                                <option>BANNED</option>
                              </select>
                              <ChevronDown className="h-2.5 w-2.5 absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                          ) : (
                            <span className={`flex items-center gap-1 text-[10px] font-semibold ${user.status === "ACTIVE" ? "text-green-400" : "text-red-400"}`}>
                              {user.status === "ACTIVE"
                                ? <CheckCircle className="h-3 w-3" />
                                : <XCircle className="h-3 w-3" />}
                              {user.status}
                            </span>
                          )}
                        </td>

                        {/* Joined */}
                        <td className="pr-4 text-slate-500 text-[10px]">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="flex items-center gap-1">
                            {editingId === user.id ? (
                              <>
                                <button
                                  onClick={() => handleSave(user.id)}
                                  disabled={saving}
                                  className="px-2.5 py-1 bg-green-600/20 border border-green-500/30 text-green-400 text-[10px] font-semibold rounded hover:bg-green-600/30 transition-colors disabled:opacity-50"
                                >
                                  {saving ? "Saving…" : "Save"}
                                </button>
                                <button
                                  onClick={() => { setEditingId(null); setEditData({}); }}
                                  className="px-2.5 py-1 bg-slate-800 border border-white/10 text-slate-400 text-[10px] rounded hover:text-white transition-colors"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => { setEditingId(user.id); setEditData({ role: user.role, plan: user.plan, status: user.status }); }}
                                  className="px-2.5 py-1 bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-semibold rounded hover:bg-blue-600/20 transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(user.id, user.username)}
                                  className="p-1.5 rounded text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  title="Delete user"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center text-slate-600 py-12">
                          <Users className="h-8 w-8 mx-auto mb-3 opacity-30" />
                          <p>{search ? "No users match your search." : "No users found."}</p>
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
    </div>
  );
}
