import React, { useState, useEffect } from "react";
import { MessageSquare, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AdminConversations() {
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    base44.entities.Conversation.filter({}, "-created_date", 100).then(setConversations).catch(() => {});
  }, []);

  const filtered = conversations.filter((c) => (c.title || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><MessageSquare className="w-6 h-6 text-[hsl(var(--km-green))]" /> Conversations</h1>
        <p className="text-muted-foreground mt-1">{conversations.length} total conversations across all farmers.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations…" className="input-base pl-10" />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="km-card p-8 text-center text-muted-foreground text-sm">No conversations found.</div>
        ) : filtered.map((c) => (
          <div key={c.id} className="km-card km-shadow p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0"><MessageSquare className="w-4 h-4 text-[hsl(var(--km-green))]" /></div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{c.title || "Untitled"}</p>
              <p className="text-xs text-muted-foreground">{c.language} • {new Date(c.created_date).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}