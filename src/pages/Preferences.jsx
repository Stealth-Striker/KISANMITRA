import React, { useState, useEffect } from "react";
import { Settings, Save, Loader2, Bell, User } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useFarm } from "@/lib/farmContext";
import { t, LANGUAGES } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const CROPS = ["Tomato", "Rice", "Wheat", "Cotton", "Onion", "Banana", "Pepper", "Mango", "Other"];
const UNITS = ["Acres", "Hectares", "Bigha", "Cents"];

export default function Preferences() {
  const { farm, language, setLanguage, refresh } = useFarm();
  const { toast } = useToast();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({ harvest: true, disease: true, market: true, diagnosis: true });

  useEffect(() => {
    if (farm) {
      setForm({
        location: farm.location || "",
        state: farm.state || "Kerala",
        district: farm.district || "",
        primary_crop: farm.primary_crop || "Tomato",
        farm_size: farm.farm_size || 2.5,
        farm_size_unit: farm.farm_size_unit || "Acres",
        language: farm.language || "English",
        phone: farm.phone || "",
      });
    } else {
      setForm({
        location: "", state: "Kerala", district: "", primary_crop: "Tomato",
        farm_size: 1, farm_size_unit: "Acres", language: "English", phone: "",
      });
    }
  }, [farm]);

  const save = async () => {
    setSaving(true);
    try {
      if (farm) {
        await base44.entities.Farm.update(farm.id, form);
      } else {
        await base44.entities.Farm.create(form);
      }
      setLanguage(form.language);
      await base44.auth.updateMe({ notification_prefs: notifPrefs });
      refresh();
      toast({ title: t(language, "saved") });
    } catch (e) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  if (!form) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--km-green))]" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-[hsl(var(--km-green))]" /> {t(language, "preferences")}
        </h1>
        <p className="text-muted-foreground mt-1">Manage your farm profile and notification preferences.</p>
      </div>

      <div className="km-card km-shadow p-6">
        <h3 className="font-semibold flex items-center gap-2 mb-5"><User className="w-4 h-4 text-[hsl(var(--km-green))]" /> Farm Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Location / Village"><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-base" placeholder="e.g. Kakkanad" /></Field>
          <Field label="District"><input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="input-base" placeholder="e.g. Ernakulam" /></Field>
          <Field label="State"><input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-base" /></Field>
          <Field label="Phone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-base" placeholder="e.g. 9876543210" /></Field>
          <Field label="Primary Crop">
            <select value={form.primary_crop} onChange={(e) => setForm({ ...form, primary_crop: e.target.value })} className="input-base">
              {CROPS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Preferred Language">
            <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="input-base">
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.native} ({l.label})</option>)}
            </select>
          </Field>
          <Field label="Farm Size"><input type="number" step="0.1" value={form.farm_size} onChange={(e) => setForm({ ...form, farm_size: Number(e.target.value) })} className="input-base" /></Field>
          <Field label="Farm Size Unit">
            <select value={form.farm_size_unit} onChange={(e) => setForm({ ...form, farm_size_unit: e.target.value })} className="input-base">
              {UNITS.map((u) => <option key={u}>{u}</option>)}
            </select>
          </Field>
        </div>
      </div>

      <div className="km-card km-shadow p-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4"><Bell className="w-4 h-4 text-[hsl(var(--km-green))]" /> Notification Preferences</h3>
        <div className="space-y-3">
          {[
            { key: "harvest", label: "Harvest reminders" },
            { key: "disease", label: "Disease outbreak alerts" },
            { key: "market", label: "Market price changes" },
            { key: "diagnosis", label: "Diagnosis results ready" },
          ].map((n) => (
            <label key={n.key} className="flex items-center justify-between p-3 rounded-xl border border-border cursor-pointer">
              <span className="text-sm">{n.label}</span>
              <input type="checkbox" checked={notifPrefs[n.key]} onChange={(e) => setNotifPrefs({ ...notifPrefs, [n.key]: e.target.checked })} className="w-5 h-5 accent-[hsl(var(--km-green))]" />
            </label>
          ))}
        </div>
      </div>

      <Button onClick={save} disabled={saving} className="bg-[hsl(var(--km-green))] hover:bg-[hsl(var(--km-green-mid))] h-11 px-6">
        {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</> : <><Save className="w-4 h-4 mr-2" /> {t(language, "save")}</>}
      </Button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm font-medium mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}