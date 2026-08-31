import React, { useState, useEffect } from "react";
import { TrendingUp, Plus, Trash2, Edit, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function AdminMarketData() {
  const { toast } = useToast();
  const [prices, setPrices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ market: "", location: "", crop: "Tomato", min_price: 14, max_price: 24, avg_price: 18, report_date: new Date().toISOString().slice(0, 10) });

  const load = () => { base44.entities.MarketPrice.filter({}, "-report_date", 100).then(setPrices).catch(() => {}); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.market || !form.location) { toast({ title: "Required", description: "Market and location required.", variant: "destructive" }); return; }
    try {
      if (editing === "new") await base44.entities.MarketPrice.create(form);
      else await base44.entities.MarketPrice.update(editing, form);
      setEditing(null);
      load();
      toast({ title: "Saved" });
    } catch (e) { toast({ title: "Failed", description: e.message, variant: "destructive" }); }
  };

  const remove = async (p) => { if (!confirm("Delete this price entry?")) return; await base44.entities.MarketPrice.delete(p.id); load(); toast({ title: "Deleted" }); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><TrendingUp className="w-6 h-6 text-[hsl(var(--km-green))]" /> Market Data</h1>
          <p className="text-muted-foreground mt-1">{prices.length} price entries — used by farmer Market Copilot.</p>
        </div>
        <Button onClick={() => { setEditing("new"); setForm({ market: "", location: "", crop: "Tomato", min_price: 14, max_price: 24, avg_price: 18, report_date: new Date().toISOString().slice(0, 10) }); }} className="bg-[hsl(var(--km-green))] hover:bg-[hsl(var(--km-green-mid))]"><Plus className="w-4 h-4 mr-2" /> Add Price</Button>
      </div>

      {editing && (
        <div className="km-card km-shadow p-5 border-2 border-[hsl(var(--km-green))]/30">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold">{editing === "new" ? "New Price Entry" : "Edit Entry"}</h3><button onClick={() => setEditing(null)} className="text-muted-foreground"><X className="w-4 h-4" /></button></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1.5 block">Market name</label><input value={form.market} onChange={(e) => setForm({ ...form, market: e.target.value })} className="input-base" placeholder="e.g. Kochi Tomato Market" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Location</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-base" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Crop</label><input value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} className="input-base" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Date</label><input type="date" value={form.report_date} onChange={(e) => setForm({ ...form, report_date: e.target.value })} className="input-base" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Min price (₹/kg)</label><input type="number" value={form.min_price} onChange={(e) => setForm({ ...form, min_price: Number(e.target.value) })} className="input-base" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Max price (₹/kg)</label><input type="number" value={form.max_price} onChange={(e) => setForm({ ...form, max_price: Number(e.target.value) })} className="input-base" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Avg price (₹/kg)</label><input type="number" value={form.avg_price} onChange={(e) => setForm({ ...form, avg_price: Number(e.target.value) })} className="input-base" /></div>
          </div>
          <div className="flex gap-2 mt-4"><Button onClick={save} className="bg-[hsl(var(--km-green))] hover:bg-[hsl(var(--km-green-mid))]">Save</Button><Button onClick={() => setEditing(null)} variant="outline">Cancel</Button></div>
        </div>
      )}

      <div className="km-card km-shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left p-3 font-medium">Market</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">Crop</th>
              <th className="text-left p-3 font-medium">Min</th>
              <th className="text-left p-3 font-medium">Max</th>
              <th className="text-left p-3 font-medium">Avg</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {prices.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No market data yet.</td></tr>
            ) : prices.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3"><p className="font-medium">{p.market}</p><p className="text-xs text-muted-foreground">{p.location}</p></td>
                <td className="p-3 hidden sm:table-cell">{p.crop}</td>
                <td className="p-3">₹{p.min_price}</td>
                <td className="p-3">₹{p.max_price}</td>
                <td className="p-3 font-semibold">₹{p.avg_price}</td>
                <td className="p-3"><div className="flex gap-1 justify-end"><button onClick={() => { setEditing(p.id); setForm(p); }} className="p-1.5 text-muted-foreground hover:text-[hsl(var(--km-green))]"><Edit className="w-4 h-4" /></button><button onClick={() => remove(p)} className="p-1.5 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}