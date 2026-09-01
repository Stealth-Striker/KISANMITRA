import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Paperclip, Mic, Send, Sprout, Volume2, Loader2, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useFarm } from "@/lib/farmContext";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { useToast } from "@/components/ui/use-toast";

const SUGGESTED = [
  "Why are my tomato leaves turning yellow?",
  "How to control early blight?",
  "Best time to harvest tomatoes?",
  "Current market price in Kochi?",
];

function formatTime(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function ChatPanel({ user, initialPrompt }) {
  const { farm, language } = useFarm();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState(null);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef(null);
  const fileRef = useRef(null);
  const recognitionRef = useRef(null);

  const crop = farm?.primary_crop || "Tomato";
  const farmerContext = {
    crop,
    location: farm ? `${farm.location || ""}, ${farm.district || ""}`.trim(", ") : "Kochi, Kerala",
    farmSize: farm?.farm_size || 2.5,
    farmSizeUnit: farm?.farm_size_unit || "Acres",
  };

  const ensureConversation = useCallback(async () => {
    if (conversationId) return conversationId;
    const conv = await base44.entities.Conversation.create({
      title: "New Conversation",
      language,
    });
    setConversationId(conv.id);
    return conv.id;
  }, [conversationId, language]);

  const send = async (text, imageUrl) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");
    const userMsg = { role: "user", content, image_url: imageUrl, created_date: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const convId = await ensureConversation();
      await base44.entities.Message.create({
        conversation_id: convId,
        role: "user",
        content,
        language,
      });

      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      const res = await base44.functions.invoke("askKisanMitra", {
        question: content,
        language,
        farmerContext,
        history,
      });

      const answer = res.data?.answer || "I'm sorry, I couldn't generate a response right now. Please try again.";
      const aiMsg = { role: "assistant", content: answer, created_date: new Date().toISOString() };
      setMessages((m) => [...m, aiMsg]);
      await base44.entities.Message.create({
        conversation_id: convId,
        role: "assistant",
        content: answer,
        language,
      });

      const title = content.slice(0, 40);
      await base44.entities.Conversation.update(convId, { title });
    } catch (e) {
      const fallback = "I'm having trouble connecting to the AI service. In Demo Mode, here's a tip: check your crop for yellowing leaves and ensure proper irrigation. Please try again shortly.";
      setMessages((m) => [...m, { role: "assistant", content: fallback, created_date: new Date().toISOString() }]);
      toast({ title: "AI unavailable", description: "Showing a fallback response.", variant: "destructive" });
    }
    setLoading(false);
  };

  // Handle prompt passed from sidebar quick prompts
  useEffect(() => {
    if (initialPrompt) {
      send(initialPrompt);
      navigate("/dashboard", { replace: true });
    }
     
  }, [initialPrompt]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)) {
      toast({ title: "Invalid file", description: "Please upload JPG, PNG, or WEBP images.", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum size is 10MB.", variant: "destructive" });
      return;
    }
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAttachedImage(file_url);
    } catch (err) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast({ title: "Voice input unavailable", description: "Your browser doesn't support speech recognition. Please type instead." });
      return;
    }
    const rec = new SR();
    rec.lang = language === "Malayalam" ? "ml-IN" : language === "Hindi" ? "hi-IN" : language === "Tamil" ? "ta-IN" : "en-IN";
    rec.interimResults = false;
    rec.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = language === "Malayalam" ? "ml-IN" : language === "Hindi" ? "hi-IN" : language === "Tamil" ? "ta-IN" : "en-IN";
    window.speechSynthesis.speak(utter);
  };

  return (
    <div className="km-card km-shadow overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-emerald-50/60 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--km-green))] flex items-center justify-center">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">{t(language, "askKisanMitra")}</h2>
            <p className="text-xs text-muted-foreground">{t(language, "typeInAnyLanguage")}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="km-chat-scroll flex-1 overflow-y-auto px-6 py-5 space-y-4 min-h-[260px] max-h-[420px] bg-[hsl(var(--km-green-light))]/40">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
              <Sprout className="w-10 h-10 text-[hsl(var(--km-green))]" />
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t(language, "namaskaram")}, {user?.full_name || "Farmer"}! {t(language, "howCanIHelp", { crop })}
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] ${m.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
              {m.image_url && (
                <div className="w-32 h-32 rounded-xl overflow-hidden ring-1 ring-border mb-1">
                  <Image src={m.image_url} className="w-full h-full object-cover" fittingType="fill" />
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[hsl(var(--km-green))] text-white rounded-br-md"
                    : "bg-white text-foreground border border-border rounded-bl-md"
                }`}
              >
                {m.content}
                {m.role === "assistant" && (
                  <button onClick={() => speak(m.content)} className="ml-2 align-middle opacity-60 hover:opacity-100">
                    <Volume2 className="w-3.5 h-3.5 inline" />
                  </button>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground px-1">{formatTime(m.created_date)}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[hsl(var(--km-green))]" />
              <span className="text-sm text-muted-foreground">Kisan Mitra is thinking…</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested prompts */}
      {messages.length === 0 && (
        <div className="px-6 pb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">{t(language, "tryAsking")}</span>
          {SUGGESTED.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="text-xs px-3 py-1.5 rounded-full bg-white border border-border text-foreground hover:border-[hsl(var(--km-green))] hover:text-[hsl(var(--km-green))] transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-4 bg-white">
        {attachedImage && (
          <div className="mb-2 inline-flex items-center gap-2 bg-muted rounded-lg p-1.5 pr-3">
            <div className="w-10 h-10 rounded overflow-hidden">
              <Image src={attachedImage} className="w-full h-full object-cover" fittingType="fill" />
            </div>
            <span className="text-xs text-muted-foreground">Photo attached</span>
            <button onClick={() => setAttachedImage(null)} className="text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-[hsl(var(--km-green))] transition-colors shrink-0"
            title={t(language, "uploadPhoto")}
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <button
            onClick={startListening}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors shrink-0 ${
              listening ? "bg-red-50 border-red-200 text-red-500" : "border-border text-muted-foreground hover:bg-muted hover:text-[hsl(var(--km-green))]"
            }`}
            title="Voice input"
          >
            <Mic className="w-4 h-4" />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder={t(language, "typeYourQuestion")}
            rows={1}
            className="flex-1 resize-none px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--km-green))]/30 max-h-32"
          />
          <Button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="bg-[hsl(var(--km-green))] hover:bg-[hsl(var(--km-green-mid))] rounded-xl h-10 w-10 p-0 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}