import React from "react";
import { Bell, ArrowRight } from "lucide-react";

export default function HarvestAlert({ message, onView, onDismiss }) {
  return (
    <div className="km-card km-shadow p-5 border-l-4 border-l-amber-400 bg-gradient-to-br from-amber-50/60 to-white">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Harvest Alert</p>
          <p className="text-sm text-foreground mt-1 leading-relaxed">{message}</p>
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={onView}
              className="text-sm font-medium text-[hsl(var(--km-green))] hover:underline flex items-center gap-1"
            >
              View recommendation <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button onClick={onDismiss} className="text-xs text-muted-foreground hover:text-foreground">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}