"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { GlowCard } from "@/components/glow-card";
import { Search, Plus, Minus, UserCheck, ShieldAlert, Key, Edit } from "lucide-react";

export default function CustomersAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/admin/customers?search=${search}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change role to ${newRole}?`)) return;
    setActionLoading(userId);
    try {
      await fetch(`/api/admin/customers`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole })
      });
      fetchUsers();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdatePlan = async (userId: string, newPlan: string) => {
    if (!confirm(`Are you sure you want to change plan to ${newPlan}?`)) return;
    setActionLoading(userId);
    try {
      await fetch(`/api/admin/customers`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan: newPlan })
      });
      fetchUsers();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddDays = async (userId: string, days: number) => {
    setActionLoading(userId);
    try {
      await fetch(`/api/admin/customers`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, addDays: days })
      });
      fetchUsers();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#020106] text-slate-100 flex">
      <Sidebar isAdmin={true} />

      <main className="flex-1 p-8 overflow-y-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold font-outfit">Customers Management</h1>
            <p className="text-xs text-slate-500">Manage user subscriptions, plans, and team roles.</p>
          </div>
        </div>

        <GlowCard glowColor="purple" className="mb-8 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search users by email or username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/60 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500 text-white"
            />
          </div>
        </GlowCard>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-slate-500 text-sm py-10">Loading customers...</div>
          ) : users.length === 0 ? (
            <div className="text-center text-slate-500 text-sm py-10">No users found.</div>
          ) : (
            users.map((u) => (
              <GlowCard key={u.id} glowColor="blue" className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white text-lg">{u.username}</h3>
                    <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full font-mono text-slate-400">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-bold ${u.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' : u.role === 'ADMIN_MINI' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      Role: {u.role}
                    </span>
                    <span className="text-slate-400">
                      Plan: <strong className="text-white">{u.plan}</strong>
                    </span>
                    {u.subscriptionEnd ? (
                      <span className={new Date(u.subscriptionEnd) > new Date() ? "text-green-400" : "text-red-400"}>
                        Ends: {new Date(u.subscriptionEnd).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-slate-500">No Sub</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select 
                    value={u.role} 
                    onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                    disabled={actionLoading === u.id}
                    className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN_MINI">Team (Mini Admin)</option>
                    <option value="ADMIN">Admin</option>
                  </select>

                  <select 
                    value={u.plan} 
                    onChange={(e) => handleUpdatePlan(u.id, e.target.value)}
                    disabled={actionLoading === u.id}
                    className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="FREE">Free</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>

                  <div className="flex border border-white/10 rounded-lg overflow-hidden">
                    <button onClick={() => handleAddDays(u.id, -1)} disabled={actionLoading === u.id} className="bg-slate-900 hover:bg-slate-800 p-1.5 text-red-400" title="Remove 1 Day">
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="bg-slate-800 px-2 flex items-center justify-center text-xs text-white">Days</div>
                    <button onClick={() => handleAddDays(u.id, 1)} disabled={actionLoading === u.id} className="bg-slate-900 hover:bg-slate-800 p-1.5 text-green-400" title="Add 1 Day">
                      <Plus className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleAddDays(u.id, 30)} disabled={actionLoading === u.id} className="bg-slate-900 hover:bg-slate-800 p-1.5 border-l border-white/10 text-blue-400 text-xs font-bold px-3" title="Add 30 Days">
                      +30
                    </button>
                  </div>
                </div>
              </GlowCard>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
