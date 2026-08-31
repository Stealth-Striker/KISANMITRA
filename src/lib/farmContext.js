import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const FarmContext = createContext(null);

export function FarmProvider({ children }) {
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState("English");
  const [demoMode, setDemoMode] = useState(false);

  const loadFarm = useCallback(async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      const farms = await base44.entities.Farm.filter({ created_by_id: me.id });
      if (farms.length > 0) {
        setFarm(farms[0]);
        setLanguageState(farms[0].language || "English");
      } else {
        setFarm(null);
      }
    } catch (e) {
      setFarm(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFarm();
  }, [loadFarm]);

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
  }, []);

  const refresh = useCallback(() => loadFarm(), [loadFarm]);

  const value = { farm, loading, language, setLanguage, demoMode, setDemoMode, refresh };
  return React.createElement(FarmContext.Provider, { value }, children);
}

export function useFarm() {
  const ctx = useContext(FarmContext);
  if (!ctx) throw new Error("useFarm must be used within FarmProvider");
  return ctx;
}