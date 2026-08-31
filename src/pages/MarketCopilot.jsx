import React, { useState, useEffect } from "react";
import { LineChart, TrendingUp, MapPin, IndianRupee, Sparkles, Loader2 } from "lucide-react";
import { LineChart as Rechart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { base44 } from "@/api/base44Client";
import { useFarm } from "@/lib/farmContext";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function MarketCopilot() {
  const { farm, language } = useFarm();
  const { toast } = useToast();
  const crop = farm?.primary_crop || "Tomato";
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [traderOffer, setTraderOffer] = useState(18);
  const [advice, setAdvice] = useState("");
  const [advising, setAdvising] = useState(false);

  useEffect(() => {
    base44.entities.MarketPrice
      .filter({ crop }, "-report_date", 20)
      .then((p) => setPrices(p))
      .catch(() => setPrices([]))
      .finally(() => setLoading(false));
  }, [crop]);

  const avg = prices.length > 0 ? Math.round(prices.reduce((s, p) => s + (p.avg_price || 0), 0) / prices.length) : 18;
  const minP = prices.length > 0 ? Math.min(...prices.map((p) => p.min_price || 0)) : 14;
  const maxP = prices.length > 0 ? Math.max(...prices.map((p) => p.max_price || 0)) : 24;

  const trendData = prices.slice().reverse().map((p, i) => ({ date: p.report_date ? new Date(p.report_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : `W${i + 1}`, price: p.avg_price || 18 }));
  if (trendData.length === 0) {
    for (let i = 5; i >= 0; i--) {
      trendData.push({ date: `W${6 - i}`, price: 16 + Math.round(Math.sin(i) * 2) + i });
    }
  }

  const getAdvice = async () => {
    setAdvising(true);
    setAdvice("");
    try {
      const res = await base44.functions.invoke("askKisanMitra", {
        question: `A trader is offering ₹${traderOffer}/kg for my ${crop}. Recent market average is ₹${avg}/kg (range ₹${minP}-₹${maxP}/kg). Is this a fair offer? What's a good negotiation range and what factors affect the price?`,
        language,
        farmerContext: { crop, location: farm?.location || "Kochi" },
        history: [],
      });
      setAdvice(res.data?.answer || "Unable to generate advice right now.");
    } catch (e) {
      setAdvice(`Demo advice: The average market price for ${crop} is ₹${avg}/kg. The trader's offer of ₹${traderOffer}/kg is ${traderOffer >= avg ? "at or above average — consider accepting" : "below average — try negotiating toward ₹" + avg}. Factors: quality, supply, transport, and seasonality.`);
    }
    setAdvising(false);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <LineChart className="w-6 h-6 text-[hsl(var(--km-green))]" /> {t(language, "marketCopilot")}
        </h1>
        <p className="text-muted-foreground mt-1">{t(language, "marketIntelligence")} — {t(language, "comparePrices")}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Current Avg" value={`₹${avg}/kg`} icon={IndianRupee} color="emerald" />
        <Stat label="Minimum" value={`₹${minP}/kg`} icon={TrendingUp} color="red" />
        <Stat label="Maximum" value={`₹${maxP}/kg`} icon={TrendingUp} color="emerald" />
        <Stat label="Nearby Markets" value={prices.length || 4} icon={MapPin} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="km-card km-shadow p-6 lg:col-span-2">
          <h3 className="font-semibold mb-4">Price Trend — {crop}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <Rechart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                <Line type="monotone" dataKey="price" stroke="hsl(var(--km-green))" strokeWidth={2.5} dot={{ r: 3 }} />
              </Rechart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trader offer + AI advice */}
        <div className="km-card km-shadow p-6">
          <h3 className="font-semibold mb-3">Negotiate an Offer</h3>
          <label className="text-sm font-medium mb-1.5 block">Trader's offer (₹/kg)</label>
          <input type="number" value={traderOffer} onChange={(e) => setTraderOffer(Number(e.target.value))} className="input-base mb-3" />
          <Button onClick={getAdvice} disabled={advising} className="w-full bg-[hsl(var(--km-green))] hover:bg-[hsl(var(--km-green-mid))]">
            {advising ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing…</> : <><Sparkles className="w-4 h-4 mr-2" /> Get AI Advice</>}
          </Button>
          {advice && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm leading-relaxed">
              {advice}
            </div>
          )}
        </div>
      </div>

      {/* Market list */}
      <div className="km-card km-shadow p-6">
        <h3 className="font-semibold mb-4">Nearby Market Prices</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : prices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No market data yet. Showing demo data: Kochi Tomato Market ₹18/kg.</p>
        ) : (
          <div className="space-y-2">
            {prices.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-border">
                <div>
                  <p className="font-medium text-sm">{p.market}</p>
                  <p className="text-xs text-muted-foreground">{p.location} • {p.report_date ? new Date(p.report_date).toLocaleDateString() : "Recent"}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{p.avg_price}/kg</p>
                  <p className="text-xs text-muted-foreground">₹{p.min_price}–₹{p.max_price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, color }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-500",
    blue: "bg-blue-50 text-blue-500",
  };
  return (
    <div className="km-card km-shadow p-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}