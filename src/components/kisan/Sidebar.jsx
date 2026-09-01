import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sprout, LayoutDashboard, Settings, MessageSquare, MapPin, Wheat, Ruler, Globe, Info, LogOut, ChevronDown, Shield } from "lucide-react";
import { useFarm } from "@/lib/farmContext";
import { t, LANGUAGES } from "@/lib/translations";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DEMO_PROMPTS = [
  { num: "01", label: "Disease + Outbreak", text: "Tomato black spots" },
  { num: "02", label: "Harvest Guardian", text: "When should I harvest?" },
  { num: "03", label: "Market Copilot", text: "Trader offers ₹18/kg" },
];

export default function Sidebar({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { farm, language, setLanguage, demoMode } = useFarm();

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, key: "overview" },
    { to: "/preferences", icon: Settings, key: "preferences" },
    { to: "/conversations", icon: MessageSquare, key: "conversationHistory" },
  ];

  const handleLogout = async () => {
    await base44.auth.logout();
    window.location.href = "/login";
  };

  const sendPrompt = (text) => {
    navigate(`/dashboard?prompt=${encodeURIComponent(text)}`);
  };

  return (
    <aside className="km-sidebar flex flex-col w-72 shrink-0 h-screen sticky top-0 text-white">
      {/* Branding */}
      <div className="px-6 pt-7 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
            <Sprout className="w-6 h-6 text-emerald-100" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none">KISAN MITRA</h1>
            <p className="text-[11px] text-emerald-200/80 mt-1">Your AI Farming Companion</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 space-y-1">
        {navItems.map((item) => {
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
              {t(language, item.key)}
            </Link>
          );
        })}
        {user?.role === 'admin' && (
          <Link
            to="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-emerald-100/80 hover:bg-white/10 hover:text-white"
          >
            <Shield className="w-[18px] h-[18px]" />
            Admin Panel
          </Link>
        )}
      </nav>

      {/* Farm Profile */}
      <div className="mx-4 mt-6 rounded-2xl bg-white/10 ring-1 ring-white/10 p-4">
        <p className="text-[11px] uppercase tracking-wider text-emerald-200/70 font-semibold mb-3">{t(language, "farmProfile")}</p>
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-emerald-200 shrink-0" />
            <span className="truncate">{farm ? `${farm.location || "—"}, ${farm.district || ""}` : "Kochi, Ernakulam"}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Wheat className="w-4 h-4 text-emerald-200 shrink-0" />
            <span className="truncate">{farm?.primary_crop || "Tomato"}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Ruler className="w-4 h-4 text-emerald-200 shrink-0" />
            <span className="truncate">{farm ? `${farm.farm_size || 2.5} ${farm.farm_size_unit || "Acres"}` : "2.5 Acres"}</span>
          </div>
        </div>
      </div>

      {/* Language Selector */}
      <div className="mx-4 mt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/10 ring-1 ring-white/10 text-sm text-white hover:bg-white/15 transition-colors">
              <span className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-emerald-200" />
                {LANGUAGES.find((l) => l.code === language)?.native || "English"}
              </span>
              <ChevronDown className="w-4 h-4 opacity-70" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60">
            {LANGUAGES.map((l) => (
              <DropdownMenuItem
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`flex items-center justify-between ${language === l.code ? "font-semibold" : ""}`}
              >
                <span>{l.native}</span>
                <span className="text-xs text-muted-foreground">{l.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Quick Demo Prompts */}
      <div className="mx-4 mt-5">
        <p className="text-[11px] uppercase tracking-wider text-emerald-200/70 font-semibold mb-2.5">{t(language, "quickDemoPrompts")}</p>
        <div className="space-y-2">
          {DEMO_PROMPTS.map((p) => (
            <button
              key={p.num}
              onClick={() => sendPrompt(p.text)}
              className="w-full text-left rounded-xl bg-white/5 hover:bg-white/15 ring-1 ring-white/10 p-3 transition-colors group"
            >
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold text-emerald-200/80">{p.num}</span>
                <span className="text-xs font-medium text-white">{p.label}</span>
              </div>
              <p className="text-[11px] text-emerald-100/70 italic">"{p.text}"</p>
            </button>
          ))}
        </div>
      </div>

      {/* Footer / Demo Mode */}
      <div className="mt-auto px-4 pb-5 pt-4">
        <div className="rounded-xl bg-amber-400/15 ring-1 ring-amber-300/30 p-3 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
            <span className="text-xs font-bold tracking-wide text-amber-100">{demoMode ? t(language, "demoMode") : "LIVE MODE"}</span>
          </div>
          <p className="text-[11px] text-amber-100/70 flex items-center gap-1">
            <Info className="w-3 h-3" />
            {demoMode ? t(language, "usingSimulatedData") : "Connected to your farm data"}
          </p>
        </div>
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-emerald-100/80 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="w-4 h-4 mr-2.5" />
          {t(language, "logout")}
        </Button>
      </div>
    </aside>
  );
}