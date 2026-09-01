import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Search, Trash2, Plus, ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useFarm } from "@/lib/farmContext";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function ConversationHistory() {
  const { language } = useFarm();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const load = () => {
    base44.entities.Conversation.filter({}, "-created_date", 50).then(setConversations).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const openConv = async (conv) => {
    setActiveConv(conv);
    setLoadingMsgs(true);
    try {
      const msgs = await base44.entities.Message.filter({ conversation_id: conv.id }, "created_date", 200);
      setMessages(msgs);
    } catch {
      setMessages([]);
    }
    setLoadingMsgs(false);
  };

  const deleteConv = async (conv) => {
    if (!confirm("Delete this conversation and all its messages?")) return;
    try {
      await base44.entities.Message.deleteMany({ conversation_id: conv.id });
      await base44.entities.Conversation.delete(conv.id);
      if (activeConv?.id === conv.id) {
        setActiveConv(null);
        setMessages([]);
      }
      load();
      toast({ title: "Conversation deleted" });
    } catch (e) {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" });
    }
  };

  const filtered = conversations.filter((c) => (c.title || "").toLowerCase().includes(search.toLowerCase()));

  const grouped = {};
  filtered.forEach((c) => {
    const d = new Date(c.created_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    (grouped[d] ||= []).push(c);
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[hsl(var(--km-green))]" /> {t(language, "conversationHistory")}
          </h1>
          <p className="text-muted-foreground mt-1">Search, open, and manage your past conversations.</p>
        </div>
        <Button onClick={() => navigate("/dashboard")} className="bg-[hsl(var(--km-green))] hover:bg-[hsl(var(--km-green-mid))]">
          <Plus className="w-4 h-4 mr-2" /> {t(language, "newConversation")}
        </Button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t(language, "searchConversations")} className="input-base pl-10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1 space-y-4">
          {filtered.length === 0 ? (
            <div className="km-card p-8 text-center text-muted-foreground text-sm">No conversations yet.</div>
          ) : (
            Object.entries(grouped).map(([date, convs]) => (
              <div key={date}>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 px-1">{date}</p>
                <div className="space-y-2">
                  {convs.map((c) => (
                    <div key={c.id} className={`km-card p-3 flex items-center gap-3 cursor-pointer transition-colors ${activeConv?.id === c.id ? "ring-2 ring-[hsl(var(--km-green))]/40" : "hover:bg-muted/40"}`} onClick={() => openConv(c)}>
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4 text-[hsl(var(--km-green))]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.title || "Untitled"}</p>
                        <p className="text-xs text-muted-foreground">{c.language}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteConv(c); }} className="text-muted-foreground hover:text-red-500 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {!activeConv ? (
            <div className="km-card km-shadow p-12 text-center text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Select a conversation to view its messages.</p>
            </div>
          ) : (
            <div className="km-card km-shadow p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                <button onClick={() => setActiveConv(null)} className="lg:hidden text-muted-foreground"><ArrowLeft className="w-4 h-4" /></button>
                <h3 className="font-semibold flex-1 truncate">{activeConv.title}</h3>
                <span className="text-xs text-muted-foreground">{activeConv.language}</span>
              </div>
              {loadingMsgs ? (
                <p className="text-sm text-muted-foreground">Loading messages…</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto km-chat-scroll pr-1">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-[hsl(var(--km-green))] text-white rounded-br-md" : "bg-muted text-foreground rounded-bl-md"}`}>
                        {m.content}
                        <div className={`text-[10px] mt-1 ${m.role === "user" ? "text-emerald-100" : "text-muted-foreground"}`}>
                          {new Date(m.created_date).toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}