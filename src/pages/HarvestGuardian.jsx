import React, { useState } from "react";
import { CalendarClock, Sprout, CheckCircle2, Clock } from "lucide-react";
import { useFarm } from "@/lib/farmContext";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";

const STAGES = ["Seedling", "Vegetative", "Flowering", "Fruiting", "Ripening"];
const CROPS = {
  Tomato: { days: 75, name: "Tomato" },
  Rice: { days: 110, name: "Rice" },
  Wheat: { days: 120, name: "Wheat" },
  Onion: { days: 100, name: "Onion" },
  Cotton: { days: 150, name: "Cotton" },
  Banana: { days: 300, name: "Banana" },
};

export default function HarvestGuardian() {
  const { farm, language } = useFarm();
  const [crop, setCrop] = useState(farm?.primary_crop || "Tomato");
  const [plantingDate, setPlantingDate] = useState(farm?.planting_date || "");
  const [variety, setVariety] = useState(farm?.variety || "");
  const [stage, setStage] = useState("Flowering");
  const [weather, setWeather] = useState("Sunny, 28°C");
  const [observations, setObservations] = useState("");
  const [result, setResult] = useState(null);

  const calculate = () => {
    const cropInfo = CROPS[crop] || { days: 90 };
    let planted = plantingDate ? new Date(plantingDate) : new Date(Date.now() - 45 * 86400000);
    const today = new Date();
    const daysSince = Math.max(0, Math.floor((today - planted) / 86400000));
    const maturityDays = cropInfo.days;
    const daysToHarvest = Math.max(0, maturityDays - daysSince);
    const harvestDate = new Date(today.getTime() + daysToHarvest * 86400000);
    const readiness = Math.min(100, Math.round((daysSince / maturityDays) * 100));

    const stageBonus = stage === "Ripening" ? 15 : stage === "Fruiting" ? 5 : 0;
    const adjReadiness = Math.min(100, readiness + stageBonus);

    let window = "7-10 days";
    if (daysToHarvest <= 3) window = "Harvest now (1-3 days)";
    else if (daysToHarvest <= 7) window = "Within a week";
    else if (daysToHarvest <= 14) window = "1-2 weeks";
    else window = `${Math.ceil(daysToHarvest / 7)} weeks`;

    const checklist = [
      `Check fruit color and firmness daily (current stage: ${stage})`,
      "Ensure adequate irrigation but reduce watering 3-4 days before harvest",
      weather.toLowerCase().includes("rain") ? "Delay harvest if heavy rain is forecast" : "Harvest in dry morning hours for best quality",
      "Arrange labour and storage in advance",
      "Inspect for pest damage before final harvest",
    ];

    const reasons = [
      `${crop} typically matures in ~${maturityDays} days; you are at day ${daysSince}.`,
      `Current growth stage (${stage}) indicates ${stage === "Ripening" ? "approaching" : "not yet at"} peak readiness.`,
      `Weather conditions (${weather}) are ${weather.toLowerCase().includes("rain") ? "unfavorable — monitor closely" : "favorable"}.`,
    ];

    setResult({ harvestDate, daysToHarvest, readiness: adjReadiness, window, checklist, reasons });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CalendarClock className="w-6 h-6 text-[hsl(var(--km-green))]" /> {t(language, "harvestGuardian")}
        </h1>
        <p className="text-muted-foreground mt-1">{t(language, "harvestTimingAssistant")} — {t(language, "estimateWhenReady")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="km-card km-shadow p-6 space-y-4">
          <h3 className="font-semibold">Crop Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Crop">
              <select value={crop} onChange={(e) => setCrop(e.target.value)} className="input-base">
                {Object.keys(CROPS).map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Variety">
              <input value={variety} onChange={(e) => setVariety(e.target.value)} placeholder="e.g. Pusa Ruby" className="input-base" />
            </Field>
            <Field label="Planting Date">
              <input type="date" value={plantingDate} onChange={(e) => setPlantingDate(e.target.value)} className="input-base" />
            </Field>
            <Field label="Current Stage">
              <select value={stage} onChange={(e) => setStage(e.target.value)} className="input-base">
                {STAGES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Weather Conditions">
              <input value={weather} onChange={(e) => setWeather(e.target.value)} className="input-base" />
            </Field>
            <Field label="Your Observations">
              <input value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="e.g. fruits turning red" className="input-base" />
            </Field>
          </div>
          <Button onClick={calculate} className="w-full bg-[hsl(var(--km-green))] hover:bg-[hsl(var(--km-green-mid))] h-11">
            <Sprout className="w-4 h-4 mr-2" /> Estimate Harvest Window
          </Button>
        </div>

        <div className="km-card km-shadow p-6">
          <h3 className="font-semibold mb-4">Recommendation</h3>
          {!result ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
              <CalendarClock className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm">Enter your crop details and calculate the harvest window.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 shrink-0">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="3.5" />
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--km-green))" strokeWidth="3.5" strokeDasharray={`${result.readiness}, 100`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{result.readiness}%</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Readiness</p>
                  <p className="text-lg font-semibold">{result.window}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> ~{result.daysToHarvest} days to harvest
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <p className="text-xs text-muted-foreground">Recommended harvest date</p>
                <p className="text-base font-semibold text-[hsl(var(--km-green))]">
                  {result.harvestDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Reasons</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {result.reasons.map((r, i) => <li key={i} className="flex gap-2"><span className="text-[hsl(var(--km-green))]">•</span>{r}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Harvest Checklist</p>
                <ul className="space-y-1.5">
                  {result.checklist.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[hsl(var(--km-green))] shrink-0 mt-0.5" /> {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
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