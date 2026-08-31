import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Ruler, MapPin, Wheat, Stethoscope, Radar, CalendarClock, LineChart } from "lucide-react";
import { useFarm } from "@/lib/farmContext";
import { t } from "@/lib/translations";
import { useNavigate } from "react-router-dom";
import FeatureCard from "@/components/kisan/FeatureCard";
import HarvestAlert from "@/components/kisan/HarvestAlert";
import ChatPanel from "@/components/kisan/ChatPanel";
import { base44 } from "@/api/base44Client";

export default function FarmerDashboard() {
  const { user } = useOutletContext();
  const { farm, language } = useFarm();
  const navigate = useNavigate();
  const [alertVisible, setAlertVisible] = useState(true);
  const [nearbyAlerts, setNearbyAlerts] = useState(0);
  const [marketPrice, setMarketPrice] = useState("₹18/kg");

  const crop = farm?.primary_crop || "Tomato";
  const locationStr = farm ? `${farm.location || "Kochi"}, ${farm.state || "Kerala"}` : "Kochi, Kerala";
  const farmSize = farm ? `${farm.farm_size || 2.5} ${farm.farm_size_unit || "Acres"}` : "2.5 Acres";

  useEffect(() => {
    base44.entities.DiseaseAlert.filter({ active: true }).then((alerts) => {
      setNearbyAlerts(alerts.length || 3);
    }).catch(() => setNearbyAlerts(3));
    base44.entities.MarketPrice.filter({ crop }).then((prices) => {
      if (prices.length > 0) {
        setMarketPrice(`₹${Math.round(prices[0].avg_price || 18)}/kg`);
      }
    }).catch(() => {});
  }, [crop]);

  const prompt = new URLSearchParams(window.location.search).get("prompt");

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {t(language, "namaskaram")}, {user?.full_name || "Ramesh"} <span className="inline-block animate-pulse">👋</span>
        </h1>
        <p className="text-muted-foreground mt-1">{t(language, "howCanIHelp", { crop })}</p>
      </div>

      {/* Context bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-border km-shadow text-sm">
          <Ruler className="w-4 h-4 text-[hsl(var(--km-green))]" />
          <span className="font-medium">{farmSize}</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-border km-shadow text-sm">
          <MapPin className="w-4 h-4 text-[hsl(var(--km-green))]" />
          <span className="font-medium">{locationStr}</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-border km-shadow text-sm">
          <Wheat className="w-4 h-4 text-[hsl(var(--km-green))]" />
          <span className="font-medium">{crop}</span>
        </div>
      </div>

      {/* Harvest alert + feature cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          {alertVisible && (
            <HarvestAlert
              message={`${crop}s may reach peak harvest readiness in ~7 days.`}
              onView={() => navigate("/harvest-guardian")}
              onDismiss={() => setAlertVisible(false)}
            />
          )}
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FeatureCard
            icon={Stethoscope}
            title={t(language, "cropDoctor")}
            subtitle={t(language, "aiCropDiagnosis")}
            description={t(language, "uploadLeafPhoto")}
            status={t(language, "ready")}
            statusColor="green"
            to={() => navigate("/crop-doctor")}
          />
          <FeatureCard
            icon={Radar}
            title={t(language, "outbreakRadar")}
            subtitle={t(language, "localDiseaseMonitoring")}
            description={t(language, "seeNearbyPest")}
            status={`${nearbyAlerts} ${t(language, "nearbyAlerts")}`}
            statusColor="red"
            to={() => navigate("/outbreak-radar")}
          />
          <FeatureCard
            icon={CalendarClock}
            title={t(language, "harvestGuardian")}
            subtitle={t(language, "harvestTimingAssistant")}
            description={t(language, "estimateWhenReady")}
            status={t(language, "monitoring")}
            statusColor="yellow"
            to={() => navigate("/harvest-guardian")}
          />
          <FeatureCard
            icon={LineChart}
            title={t(language, "marketCopilot")}
            subtitle={t(language, "marketIntelligence")}
            description={t(language, "comparePrices")}
            status={`${marketPrice} nearby`}
            statusColor="blue"
            to={() => navigate("/market-copilot")}
          />
        </div>
      </div>

      {/* Chat */}
      <ChatPanel user={user} initialPrompt={prompt} />
    </div>
  );
}