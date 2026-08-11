"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { GlowCard } from "@/components/glow-card";
import { ShieldAlert, Users, Trash2, Ban, CheckCircle2 } from "lucide-react";

interface SystemUser {
  id: string;
  username: string;
  email: string;
  role: string;
  plan: string;
  status: string;
  createdAt: string;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const usersRes = await fetch("/api/admin/users");
      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsers(usersData.users);
      }

      const logsRes = await fetch("/api/admin/logs");
      const logsData = await logsRes.json();
      if (logsData.success) {
        setLogs(logsData.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "BANNED" : "ACTIVE";
    if (!confirm(`Are you sure you want to change user status to ${nextStatus}?`)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: nextStatus }),
      });
      if (res.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangePlan = async (userId: string, planUpper: string) => {
    try {
      const res = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan: planUpper }),
      });
      if (res.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, plan: planUpper } : u)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#020106] text-slate-100 flex">
      <Sidebar isAdmin={true} />

      <main className="flex-1 p-8 overflow-y-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-outfit flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-500" /> Platform Administration Panel
          </h1>
          <p className="text-xs text-slate-500">Manage all registered developers, modify plans, view global API audit logs.</p>
        </div>

        {loading ? (
          <div className="text-xs text-slate-500 font-mono">Initializing admin portal data...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* System Users lists */}
            <div className="lg:col-span-2">
              <GlowCard glowColor="red">
                <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-400" /> Registered Platform Users
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead>
                      <tr className="border-b border-white/5 pb-2 text-slate-500 uppercase font-bold text-[10px]">
                        <th className="py-2">User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Plan</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 font-semibold text-white">{u.username}</td>
                          <td>{u.email}</td>
                          <td>
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                              className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-[10px] focus:outline-none"
                            >
                              <option value="USER">USER</option>
                              <option value="ADMIN_MINI">TEAM (MINI)</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </td>
                          <td>
                            <select
                              value={u.plan}
                              onChange={(e) => handleChangePlan(u.id, e.target.value)}
                              className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-[10px] focus:outline-none font-bold text-blue-400"
                            >
                              <option value="FREE">FREE</option>
                              <option value="BASIC">BASIC</option>
                              <option value="PRO">PRO</option>
                            </select>
                          </td>
                          <td>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                u.status === "ACTIVE"
                                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                                  : "bg-red-500/10 border border-red-500/30 text-red-400"
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="py-2.5">
                            <button
                              onClick={() => handleUpdateUserStatus(u.id, u.status)}
                              className={`p-1.5 rounded-lg border text-xs font-semibold ${
                                u.status === "ACTIVE"
                                  ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white"
                                  : "bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-600 hover:text-white"
                              } transition-colors`}
                            >
                              {u.status === "ACTIVE" ? "Ban User" : "Unban"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlowCard>
            </div>

            {/* Global Logs panel */}
            <div>
              <GlowCard glowColor="red">
                <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
                  System Logs
                </h3>
                <div className="flex flex-col gap-4 max-h-[450px] overflow-y-auto pr-2">
                  {logs.map((log) => (
                    <div key={log.id} className="border-b border-white/5 pb-2 text-[10px]">
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span className="font-semibold text-blue-400">{log.action}</span>
                        <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-300 mb-1">{log.message}</p>
                      {log.application && (
                        <span className="text-[9px] bg-slate-900 border border-white/5 px-1 py-0.5 rounded text-slate-500">
                          App: {log.application.name}
                        </span>
                      )}
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-center text-slate-500 py-10">No logs registered.</div>
                  )}
                </div>
              </GlowCard>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
