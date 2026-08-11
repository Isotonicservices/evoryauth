"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  Cpu,
  Key,
  Database,
  Settings,
  ShieldAlert,
  LogOut,
  Users,
  Code2
} from "lucide-react";

interface SidebarProps {
  isAdmin?: boolean;
}

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
        }
      } catch (e) { console.error(e); }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) router.push("/login");
    } catch (e) { console.error(e); }
  };

  const menuItems = [
    { icon: <LayoutDashboard className="h-4 w-4" />, label: "Overview", href: "/dashboard" },
    { icon: <Cpu className="h-4 w-4" />, label: "Applications", href: "/dashboard/apps" },
    { icon: <Key className="h-4 w-4" />, label: "Licenses", href: "/dashboard/licenses" },
    { icon: <Users className="h-4 w-4" />, label: "App Users", href: "/dashboard/app-users" },
    { icon: <Database className="h-4 w-4" />, label: "CDN Files", href: "/dashboard/files" },
    { icon: <Code2 className="h-4 w-4" />, label: "API Reference", href: "/dashboard/api" },
    { icon: <Settings className="h-4 w-4" />, label: "Settings", href: "/dashboard/settings" },
  ];

  const adminItems = [
    { icon: <Users className="h-4 w-4" />, label: "User Management", href: "/dashboard/users" },
    { icon: <ShieldAlert className="h-4 w-4" />, label: "Admin Panel", href: "/admin" },
  ];

  const NavLink = ({ href, icon, label, isRed = false }: { href: string; icon: React.ReactNode; label: string; isRed?: boolean }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-300 relative overflow-hidden ${
          isActive
            ? isRed 
              ? "bg-gradient-to-r from-red-600/10 to-transparent text-red-400"
              : "bg-gradient-to-r from-red-600/10 to-transparent text-red-400"
            : "text-slate-400 hover:text-white hover:bg-white/5"
        }`}
      >
        {isActive && (
          <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 rounded-r-full animate-pulse ${
            isRed ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
          }`} />
        )}
        
        <div className={`transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110 group-hover:rotate-3"}`}>
          {icon}
        </div>
        <span className="relative z-10">{label}</span>
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-[#05050a]/80 backdrop-blur-3xl border-r border-white/5 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-40 relative overflow-hidden">
      {/* Background glow for sidebar */}
      <div className="absolute top-0 left-0 w-full h-64 bg-red-500/5 blur-[100px] pointer-events-none" />
      
      <div className="flex flex-col gap-6 p-6 relative z-10">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 group" suppressHydrationWarning>
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <img src="/logo.png" alt="Logo" className="h-9 w-9 object-contain relative z-10 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-transform group-hover:scale-110" />
          </div>
          <span className="font-outfit text-xl font-bold bg-gradient-to-r from-white via-red-200 to-red-400 bg-clip-text text-transparent tracking-wide">
            Hyper Auth
          </span>
        </Link>

        {/* User Profile Section */}
        {user && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 p-[2px] flex-shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <div className="h-full w-full rounded-full bg-[#0a0a14] flex items-center justify-center text-sm font-bold text-white uppercase overflow-hidden">
                {user.username.substring(0, 2)}
              </div>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-white truncate">{user.username}</span>
              <span className={`text-[9px] font-bold tracking-widest uppercase ${user.role === 'ADMIN' ? 'text-red-400' : 'text-white'}`}>
                {user.role}
              </span>
            </div>
          </div>
        )}

        <nav className="flex flex-col gap-1 mt-2">
          <span className="text-[10px] uppercase font-extrabold text-slate-600 tracking-[0.2em] mb-2 px-2">Developer</span>
          {menuItems.map(item => (
            <NavLink key={item.href} {...item} />
          ))}

          {isAdmin && (
            <>
              <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-4" />
              <span className="text-[10px] uppercase font-extrabold text-red-500/60 tracking-[0.2em] mb-2 px-2">System Admin</span>
              {adminItems.map(item => (
                <NavLink key={item.href} {...item} isRed />
              ))}
            </>
          )}
        </nav>
      </div>

      <div className="p-6 relative z-10">
        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-red-500/20 border border-transparent hover:border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all duration-300 group"
        >
          <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Terminate Session
        </button>
      </div>
      
      {/* Decorative cyber grid at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        maskImage: 'linear-gradient(to top, black, transparent)'
      }} />
    </aside>
  );
}
