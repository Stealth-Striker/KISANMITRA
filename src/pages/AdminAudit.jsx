import React, { useState, useEffect } from "react";
import { ScrollText, User, Bug, TrendingUp, Stethoscope, LogIn } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Build a synthetic audit view from recent entity activity
    Promise.all([
      base44.entities.User.list().catch(() => []),
      base44.entities.CropDiagnosis.filter({}, "-created_date", 10).catch(() => []),
      base44.entities.DiseaseAlert.filter({}, "-created_date", 10).catch(() => []),
      base44.entities.MarketPrice.filter({}, "-created_date", 10).catch(() => []),
      base44.entities.Conversation.filter({}, "-created_date", 10).catch(() => []),
    ]).then(([users, diagnoses, alerts, prices, convs]) => {
      const entries = [];
      users.forEach((u) => entries.push({ id: `u-${u.id}`, icon: User, action: "User registered", detail: `${u.full_name} (${u.email})`, date: u.created_date, color: "emerald" }));
      diagnoses.forEach((d) => entries.push({ id: `d-${d.id}`, icon: Stethoscope, action: "Crop diagnosis", detail: `${d.disease} on ${d.crop}`, date: d.created_date, color: "amber" }));
      alerts.forEach((a) => entries.push({ id: `a-${a.id}`, icon: Bug, action: "Disease alert created", detail: `${a.disease} — ${a.location}`, date: a.created_date, color: "red" }));
      prices.forEach((p) => entries.push({ id: `p-${p.id}`, icon: TrendingUp, action: "Market price added", detail: `${p.market} ${p.crop} ₹${p.avg_price}/kg`, date: p.created_date, color: "blue" }));
      convs.forEach((c) => entries.push({ id: `c-${c.id}`, icon: LogIn, action: "Conversation started", detail: c.title, date: c.created_date, color: "emerald" }));
      entries.sort((a, b) => new Date(b.date) - new Date(a.date));
      setLogs(entries.slice(0, 40));
    });
  }, []);

  const colors = { emerald: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", red: "bg-red-50 text-red-600", blue: "bg-blue-50 text-blue-600" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><ScrollText className="w-6 h-6 text-[hsl(var(--km-green))]" /> Audit Logs</h1>
        <p className="text-muted-foreground mt-1">Recent platform activity across all entities.</p>
      </div>
      <div className="space-y-2">
        {logs.length === 0 ? (
          <div className="km-card p-8 text-center text-muted-foreground text-sm">No activity recorded yet.</div>
        ) : logs.map((l) => (
          <div key={l.id} className="km-card km-shadow p-3.5 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colors[l.color]}`}><l.icon className="w-4 h-4" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{l.action}</p>
              <p className="text-xs text-muted-foreground truncate">{l.detail}</p>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">{new Date(l.date).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}