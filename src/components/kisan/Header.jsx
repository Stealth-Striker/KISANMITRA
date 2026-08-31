import React from "react";
import { Sprout, ChevronDown, LogOut, User, Settings, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFarm } from "@/lib/farmContext";
import { base44 } from "@/api/base44Client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

export default function Header({ user }) {
  const navigate = useNavigate();
  const { demoMode } = useFarm();
  const { toast } = useToast();
  const name = user?.full_name || "Farmer";

  const handleLogout = async () => {
    await base44.auth.logout();
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-6 lg:px-8 h-16">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[hsl(var(--km-green))] flex items-center justify-center lg:hidden">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-base font-bold tracking-tight text-foreground leading-none">KISAN MITRA</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">Multilingual Voice & Chat Farming Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 ring-1 ring-emerald-200">
            <span className={`w-2 h-2 rounded-full ${demoMode ? "bg-amber-400" : "bg-emerald-500"} animate-pulse`} />
            <span className="text-xs font-medium text-emerald-800">{demoMode ? "Demo Mode" : "Live Mode"}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-muted transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-sm font-semibold">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium leading-none">{name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Farmer</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {user?.role === "admin" && (
                <DropdownMenuItem onClick={() => navigate("/admin")}>
                  <Shield className="w-4 h-4 mr-2" /> Admin Panel
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => navigate("/preferences")}>
                <User className="w-4 h-4 mr-2" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/preferences")}>
                <Settings className="w-4 h-4 mr-2" /> Preferences
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}