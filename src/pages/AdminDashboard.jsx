import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Users, Bug, TrendingUp, MessageSquare, Stethoscope, Activity, Sprout } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AdminDashboard() {
  const { user } = useOutletContext();
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    Promise.all([
      base44.entities.User.list().catch(() => []),
      base44.entities.Farm.list().catch(() => []),
      base44.entities.CropDiagnosis.list().catch(() => []),
      base44.entities.DiseaseAlert.filter({ active: true }).catch(() => []),
      base44.entities.Conversation.list().catch(() => []),
      base44.entities.MarketPrice.list().catch(() => []),
    ]).then(([users, farms, diagnoses, alerts, conversations, prices]) => {
      const farmers = users.filter((u) => u.role !== "admin");
      setMetrics({
        totalFarmers: farmers.length,
        totalFarms: farms.length,
        diagnoses: diagnoses.length,
        activeAlerts: alerts.length,
        conversations: conversations.length,
        marketPrices: prices.length,
      });
    });
  }, []);

  const cards = [
    { label: "Total Farmers", value: metrics.totalFarmers ?? 0, icon: Users, color: "emerald" },
    { label: "Total Farms", value: metrics.totalFarms ?? 0, icon: Sprout, color: "blue" },
    { label: "Crop Diagnoses", value: metrics.diagnoses ?? 0, icon: Stethoscope, color: "amber" },
    { label: "Active Disease Alerts", value: metrics.activeAlerts ?? 0, icon: Bug, color: "red" },
    { label: "Conversations", value: metrics.conversations ?? 0, icon: MessageSquare, color: "emerald" },
    { label: "Market Data Points", value: metrics.marketPrices ?? 0, icon: TrendingUp, color: "blue" },
  ];

  const colors = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user?.full_name || "Admin"}. Here's your platform overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="km-card km-shadow p-5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 ${colors[c.color]}`}>
              <c.icon className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold">{c.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="km-card km-shadow p-6">
        <h3 className="font-semibold flex items-center gap-2 mb-3"><Activity className="w-4 h-4 text-[hsl(var(--km-green))]" /> System Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatusItem label="AI Service" status="Operational" color="emerald" />
          <StatusItem label="Database" status="Connected" color="emerald" />
          <StatusItem label="Demo Mode" status="Available" color="amber" />
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, status, color }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl border border-border">
      <span className={`w-2.5 h-2.5 rounded-full bg-${color}-500`} />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}