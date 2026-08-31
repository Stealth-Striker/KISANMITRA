import React, { useState, useEffect } from "react";
import { Radar, MapPin, Bug, AlertTriangle, Filter } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useFarm } from "@/lib/farmContext";
import { t } from "@/lib/translations";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const SEVERITY_STYLES = {
  Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Moderate: "bg-amber-50 text-amber-700 border-amber-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Severe: "bg-red-50 text-red-700 border-red-200",
};

// Demo coordinates near Kochi
const DEMO_COORDS = [
  { lat: 10.0, lng: 76.34 },
  { lat: 9.97, lng: 76.28 },
  { lat: 10.05, lng: 76.4 },
];

export default function OutbreakRadar() {
  const { language } = useFarm();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCrop, setFilterCrop] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");

  useEffect(() => {
    base44.entities.DiseaseAlert
      .filter({ active: true }, "-report_date", 50)
      .then((a) => setAlerts(a))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = alerts.filter(
    (a) =>
      (filterCrop === "all" || a.crop === filterCrop) &&
      (filterSeverity === "all" || a.severity === filterSeverity)
  );

  const crops = [...new Set(alerts.map((a) => a.crop).filter(Boolean))];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Radar className="w-6 h-6 text-[hsl(var(--km-green))]" /> {t(language, "outbreakRadar")}
        </h1>
        <p className="text-muted-foreground mt-1">{t(language, "localDiseaseMonitoring")} — {t(language, "seeNearbyPest")}</p>
      </div>

      {/* Map */}
      <div className="km-card km-shadow overflow-hidden">
        <div className="h-64 w-full">
          <MapContainer center={[10.0, 76.34]} zoom={10} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
            {filtered.map((a, i) => (
              <Marker key={a.id} position={DEMO_COORDS[i % DEMO_COORDS.length]}>
                <Popup>
                  <strong>{a.disease}</strong>
                  <br />
                  {a.location} • {a.severity}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select value={filterCrop} onChange={(e) => setFilterCrop(e.target.value)} className="px-3 py-2 rounded-xl border border-border bg-white text-sm">
          <option value="all">All crops</option>
          {crops.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="px-3 py-2 rounded-xl border border-border bg-white text-sm">
          <option value="all">All severity</option>
          {["Low", "Moderate", "High", "Severe"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} alerts</span>
      </div>

      {/* Alerts list */}
      {loading ? (
        <div className="km-card p-8 text-center text-muted-foreground">Loading alerts…</div>
      ) : filtered.length === 0 ? (
        <div className="km-card km-shadow p-8 text-center">
          <Bug className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
          <p className="text-sm text-muted-foreground">No active alerts match your filters. Your area looks clear!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a, i) => (
            <div key={a.id} className="km-card km-shadow p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{a.disease}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${SEVERITY_STYLES[a.severity] || ""}`}>
                    {a.severity}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{a.alert_type}</span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {a.location}</span>
                  <span>• {a.crop}</span>
                  <span>• {a.report_date ? new Date(a.report_date).toLocaleDateString() : "Recent"}</span>
                </div>
                {a.recommended_action && (
                  <p className="text-sm text-muted-foreground mt-2"><span className="font-medium text-foreground">Action: </span>{a.recommended_action}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}