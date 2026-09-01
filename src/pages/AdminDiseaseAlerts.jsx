import React, { useState, useEffect } from "react";
import { Bug, Plus, Trash2, Edit, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const SEVERITY = ["Low", "Moderate", "High", "Severe"];
const TYPES = ["Disease", "Pest"];

export default function AdminDiseaseAlerts() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ disease: "", alert_type: "Disease", location: "", severity: "Moderate", crop: "Tomato", report_date: new Date().toISOString().slice(0, 10), recommended_action: "", active: true });

  const load = () => {
    base44.entities.DiseaseAlert.filter({}, "-report_date", 100).then(setAlerts).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing("new");
    setForm({ disease: "", alert_type: "Disease", location: "", severity: "Moderate", crop: "Tomato", report_date: new Date().toISOString().slice(0, 10), recommended_action: "", active: true });
  };

  const save = async () => {
    if (!form.disease || !form.location) {
      toast({ title: "Required", description: "Disease and location are required.", variant: "destructive" });
      return;
    }
    try {
      if (editing === "new") {
        await base44.entities.DiseaseAlert.create(form);
      } else {
        await base44.entities.DiseaseAlert.update(editing, form);
      }
      setEditing(null);
      load();
      toast({ title: "Alert saved" });
    } catch (e) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  const remove = async (a) => {
    if (!confirm("Delete this alert?")) return;
    await base44.entities.DiseaseAlert.delete(a.id);
    load();
    toast({ title: "Alert deleted" });
  };

  const sevColor = { Low: "text-emerald-700 bg-emerald-50", Moderate: "text-amber-700 bg-amber-50", High: "text-orange-700 bg-orange-50", Severe: "text-red-700 bg-red-50" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Bug className="w-6 h-6 text-[hsl(var(--km-green))]" /> Disease Alerts</h1>
          <p className="text-muted-foreground mt-1">{alerts.length} alerts — changes appear instantly on farmer dashboards.</p>
        </div>
        <Button onClick={openNew} className="bg-[hsl(var(--km-green))] hover:bg-[hsl(var(--km-green-mid))]"><Plus className="w-4 h-4 mr-2" /> Add Alert</Button>
      </div>

      {editing && (
        <div className="km-card km-shadow p-5 border-2 border-[hsl(var(--km-green))]/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{editing === "new" ? "New Alert" : "Edit Alert"}</h3>
            <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1.5 block">Disease / Pest name</label><input value={form.disease} onChange={(e) => setForm({ ...form, disease: e.target.value })} className="input-base" placeholder="e.g. Early Blight" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Location</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-base" placeholder="e.g. Kochi" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Crop</label><input value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} className="input-base" /></div>
            <div><label className="text-sm font-medium mb-1.5 block">Type</label><select value={form.alert_type} onChange={(e) => setForm({ ...form, alert_type: e.target.value })} className="input-base">{TYPES.map((x) => <option key={x}>{x}</option>)}</select></div>
            <div><label className="text-sm font-medium mb-1.5 block">Severity</label><select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="input-base">{SEVERITY.map((x) => <option key={x}>{x}</option>)}</select></div>
            <div><label className="text-sm font-medium mb-1.5 block">Date</label><input type="date" value={form.report_date} onChange={(e) => setForm({ ...form, report_date: e.target.value })} className="input-base" /></div>
            <div className="sm:col-span-2"><label className="text-sm font-medium mb-1.5 block">Recommended Action</label><textarea value={form.recommended_action} onChange={(e) => setForm({ ...form, recommended_action: e.target.value })} className="input-base" rows={2} /></div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={save} className="bg-[hsl(var(--km-green))] hover:bg-[hsl(var(--km-green-mid))]">Save</Button>
            <Button onClick={() => setEditing(null)} variant="outline">Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="km-card p-8 text-center text-muted-foreground text-sm">No alerts yet. Add one to show farmers.</div>
        ) : alerts.map((a) => (
          <div key={a.id} className="km-card km-shadow p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0"><Bug className="w-5 h-5 text-red-500" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold">{a.disease}</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sevColor[a.severity]}`}>{a.severity}</span>
                {!a.active && <span className="px-2 py-0.5 rounded-full text-xs bg-muted">Inactive</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{a.location} • {a.crop} • {a.report_date ? new Date(a.report_date).toLocaleDateString() : "—"}</p>
            </div>
            <button onClick={() => { setEditing(a.id); setForm(a); }} className="p-2 text-muted-foreground hover:text-[hsl(var(--km-green))]"><Edit className="w-4 h-4" /></button>
            <button onClick={() => remove(a)} className="p-2 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}