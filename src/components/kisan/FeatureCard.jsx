import React from "react";
import { ArrowRight } from "lucide-react";

const STATUS_STYLES = {
  green: { dot: "bg-emerald-500", text: "text-emerald-700", label: "" },
  red: { dot: "bg-red-500", text: "text-red-600", label: "" },
  yellow: { dot: "bg-amber-400", text: "text-amber-700", label: "" },
  blue: { dot: "bg-blue-500", text: "text-blue-600", label: "" },
};

export default function FeatureCard({ icon: Icon, title, subtitle, description, status, statusColor, to }) {
  const st = STATUS_STYLES[statusColor] || STATUS_STYLES.green;
  return (
    <button
      onClick={to}
      className="km-card km-shadow text-left p-5 flex flex-col h-full hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center ring-1 ring-emerald-100">
          <Icon className="w-6 h-6 text-[hsl(var(--km-green))]" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${st.dot}`} />
          <span className={`text-xs font-medium ${st.text}`}>{status}</span>
        </div>
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{description}</p>
      <div className="mt-4 flex items-center justify-end">
        <span className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-[hsl(var(--km-green))] group-hover:bg-[hsl(var(--km-green))] group-hover:text-white transition-colors">
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </button>
  );
}