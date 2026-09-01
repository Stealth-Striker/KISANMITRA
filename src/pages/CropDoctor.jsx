import React, { useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { Loader2, Stethoscope, Image as ImageIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useFarm } from "@/lib/farmContext";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { useToast } from "@/components/ui/use-toast";

const CROPS = ["Tomato", "Rice", "Wheat", "Cotton", "Onion", "Banana", "Pepper", "Mango", "Other"];

export default function CropDoctor() {
  const { user } = useOutletContext();
  const { farm, language } = useFarm();
  const { toast } = useToast();
  const fileRef = useRef(null);
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState(farm?.primary_crop || "Tomato");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  React.useEffect(() => {
    base44.entities.CropDiagnosis.filter({}, "-created_date", 5).then(setHistory).catch(() => {});
  }, []);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)) {
      toast({ title: "Invalid file", description: "JPG, PNG, or WEBP only.", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 10MB.", variant: "destructive" });
      return;
    }
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImage(file_url);
      setResult(null);
    } catch (err) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    }
  };

  const analyze = async () => {
    if (!image) {
      toast({ title: "No image", description: "Please upload a leaf photo first.", variant: "destructive" });
      return;
    }
    setAnalyzing(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("analyzeCrop", { image_url: image, crop, language });
      const diag = res.data?.diagnosis;
      if (!diag) throw new Error("No diagnosis returned");
      setResult(diag);
      const record = await base44.entities.CropDiagnosis.create({
        image_url: image,
        crop,
        disease: diag.disease,
        confidence: diag.confidence,
        symptoms: diag.symptoms,
        recommended_actions: diag.recommended_actions,
        prevention: diag.prevention,
        severity: diag.severity,
        language,
      });
      setHistory((h) => [record, ...h].slice(0, 5));
    } catch (e) {
      toast({ title: "Analysis failed", description: e.message, variant: "destructive" });
    }
    setAnalyzing(false);
  };

  const severityColor = {
    Low: "text-emerald-600 bg-emerald-50",
    Moderate: "text-amber-600 bg-amber-50",
    High: "text-orange-600 bg-orange-50",
    Severe: "text-red-600 bg-red-50",
    Healthy: "text-emerald-600 bg-emerald-50",
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-[hsl(var(--km-green))]" /> {t(language, "cropDoctor")}
        </h1>
        <p className="text-muted-foreground mt-1">{t(language, "aiCropDiagnosis")} — {t(language, "uploadLeafPhoto")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload */}
        <div className="km-card km-shadow p-6">
          <h3 className="font-semibold mb-4">Upload & Analyze</h3>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-[hsl(var(--km-green))] hover:bg-emerald-50/40 transition-colors min-h-[200px]"
          >
            {image ? (
              <div className="w-full max-w-[200px] aspect-square rounded-xl overflow-hidden">
                <Image src={image} className="w-full h-full object-cover" fittingType="fill" />
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                  <ImageIcon className="w-7 h-7 text-[hsl(var(--km-green))]" />
                </div>
                <p className="text-sm font-medium">Click to upload a leaf photo</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP — max 10MB</p>
              </>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />

          <div className="mt-4">
            <label className="text-sm font-medium mb-1.5 block">Crop</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--km-green))]/30"
            >
              {CROPS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <Button
            onClick={analyze}
            disabled={!image || analyzing}
            className="w-full mt-4 bg-[hsl(var(--km-green))] hover:bg-[hsl(var(--km-green-mid))] h-11"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t(language, "analyzing")}
              </>
            ) : (
              <>
                <Stethoscope className="w-4 h-4 mr-2" /> {t(language, "analyze")}
              </>
            )}
          </Button>
        </div>

        {/* Result */}
        <div className="km-card km-shadow p-6">
          <h3 className="font-semibold mb-4">Diagnosis Result</h3>
          {!result && !analyzing && (
            <div className="flex flex-col items-center justify-center text-center py-12 text-muted-foreground">
              <Stethoscope className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm">Upload a photo and click Analyze to see the diagnosis.</p>
            </div>
          )}
          {analyzing && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--km-green))] mb-3" />
              <p className="text-sm text-muted-foreground">{t(language, "analyzing")}</p>
            </div>
          )}
          {result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Likely condition</p>
                  <p className="text-lg font-semibold">{result.disease}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${severityColor[result.severity] || "bg-muted"}`}>
                  {result.severity}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-[hsl(var(--km-green))]" style={{ width: `${result.confidence}%` }} />
                </div>
                <span className="text-sm font-medium">{Math.round(result.confidence)}% confidence</span>
              </div>
              <Field label="Symptoms" value={result.symptoms} />
              <Field label="Recommended Actions" value={result.recommended_actions} />
              <Field label="Prevention" value={result.prevention} />
              {result.seek_expert && <Field label="When to seek expert help" value={result.seek_expert} />}
            </div>
          )}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="km-card km-shadow p-6">
          <h3 className="font-semibold mb-4">Recent Diagnoses</h3>
          <div className="space-y-3">
            {history.map((h) => (
              <div key={h.id} className="flex items-center gap-4 p-3 rounded-xl border border-border">
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <Image src={h.image_url} className="w-full h-full object-cover" fittingType="fill" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{h.disease}</p>
                  <p className="text-xs text-muted-foreground">{h.crop} • {new Date(h.created_date).toLocaleDateString()}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${severityColor[h.severity] || "bg-muted"}`}>
                  {h.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  );
}