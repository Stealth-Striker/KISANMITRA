import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Bug, TrendingUp, MessageSquare, ScrollText, LogOut, Shield, Sprout } from "lucide-react";
import { base44 } from "@/api/base44Client";

const NAV = [
  { to: "/dashboard", icon: Sprout, label: "Farmer View" },
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/farmers", icon: Users, label: "Farmers" },
  { to: "/admin/disease-alerts", icon: Bug, label: "Disease Alerts" },
  { to: "/admin/market-data", icon: TrendingUp, label: "Market Data" },
  { to: "/admin/conversations", icon: MessageSquare, label: "Conversations" },
  { to: "/admin/audit", icon: ScrollText, label: "Audit Logs" },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await base44.auth.logout();
    window.location.href = "/login";
  };

  return (
    <aside className="km-sidebar flex flex-col w-64 shrink-0 h-screen sticky top-0 text-white">
      <div className="px-6 pt-7 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center ring-1 ring-white/20">
            <Shield className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight leading-none">ADMIN</h1>
            <p className="text-[11px] text-emerald-200/80 mt-1">Kisan Mitra Console</p>
          </div>
        </div>
      </div>
      <nav className="px-3 space-y-1 flex-1">
        {NAV.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active ? "bg-white/15 text-white font-medium" : "text-emerald-100/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 pb-5 pt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-emerald-100/80 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
}