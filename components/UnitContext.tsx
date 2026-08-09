"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type TempUnit = "C" | "F";

interface UnitContextType {
  unit: TempUnit;
  toggleUnit: () => void;
  setUnit: (unit: TempUnit) => void;
  formatTemp: (celsiusTemp?: number | null) => string;
  formatTempWithUnit: (celsiusTemp?: number | null) => string;
  convertTemp: (celsiusTemp?: number | null) => number | null;
}

const UnitContext = createContext<UnitContextType>({
  unit: "C",
  toggleUnit: () => {},
  setUnit: () => {},
  formatTemp: (t) => (t != null ? `${Math.round(t)}°` : "—"),
  formatTempWithUnit: (t) => (t != null ? `${Math.round(t)}°C` : "—"),
  convertTemp: (t) => (t != null ? Math.round(t) : null),
});

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnitState] = useState<TempUnit>("C");

  useEffect(() => {
    const saved = localStorage.getItem("weather_unit") as TempUnit | null;
    if (saved === "C" || saved === "F") {
      setUnitState(saved);
    }
  }, []);

  const setUnit = (newUnit: TempUnit) => {
    setUnitState(newUnit);
    localStorage.setItem("weather_unit", newUnit);
  };

  const toggleUnit = () => {
    const next = unit === "C" ? "F" : "C";
    setUnit(next);
  };

  const convertTemp = (celsiusTemp?: number | null): number | null => {
    if (celsiusTemp == null || isNaN(celsiusTemp)) return null;
    if (unit === "F") {
      return Math.round((celsiusTemp * 9) / 5 + 32);
    }
    return Math.round(celsiusTemp);
  };

  const formatTemp = (celsiusTemp?: number | null): string => {
    const val = convertTemp(celsiusTemp);
    if (val == null) return "—";
    return `${val > 0 ? "+" : ""}${val}°`;
  };

  const formatTempWithUnit = (celsiusTemp?: number | null): string => {
    const val = convertTemp(celsiusTemp);
    if (val == null) return "—";
    return `${val > 0 ? "+" : ""}${val}°${unit}`;
  };

  return (
    <UnitContext.Provider
      value={{ unit, toggleUnit, setUnit, formatTemp, formatTempWithUnit, convertTemp }}
    >
      {children}
    </UnitContext.Provider>
  );
}

export function useUnit() {
  return useContext(UnitContext);
}
