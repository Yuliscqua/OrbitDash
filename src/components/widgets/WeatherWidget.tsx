import React, { useEffect } from "react";
import { Wind, Droplets, Thermometer, MapPin } from "lucide-react";
import type { WidgetConfig, DisplayMode, WeatherData } from "../../types";
import { WidgetWrapper } from "./WidgetWrapper";
import { useWidgetStore } from "../../hooks/useWidgetStore";

interface WeatherWidgetProps {
  config: WidgetConfig;
  mode: DisplayMode;
  onAdminEdit?: () => void;
  dragHandleProps?: Record<string, unknown>;
  widgetDragProps?: Record<string, unknown>;
}

// ── Simulation : légère variation toutes les 30s ──────────────────────────────
function useWeatherSimulation(config: WidgetConfig) {
  const updateWidgetData = useWidgetStore((s) => s.updateWidgetData);
  const data = config.data as unknown as WeatherData;

  useEffect(() => {
    const id = setInterval(() => {
      const drift = (Math.random() - 0.5) * 0.4;
      updateWidgetData(config.id, {
        temperature: Math.round((data.temperature + drift) * 10) / 10,
        feelsLike: Math.round((data.feelsLike + drift * 0.8) * 10) / 10,
        windSpeed: Math.max(0, Math.round((data.windSpeed + (Math.random() - 0.5) * 1) * 10) / 10),
        humidity: Math.min(100, Math.max(20, data.humidity + Math.round((Math.random() - 0.5) * 2))),
      });
    }, 30_000);
    return () => clearInterval(id);
  }, [data.temperature, data.feelsLike, data.windSpeed, data.humidity]);
}

export function WeatherWidget({ config, mode, onAdminEdit, dragHandleProps, widgetDragProps }: WeatherWidgetProps) {
  const data = config.data as unknown as WeatherData;
  useWeatherSimulation(config);

  return (
    <WidgetWrapper config={config} mode={mode} onAdminEdit={onAdminEdit}
      dragHandleProps={dragHandleProps} widgetDragProps={widgetDragProps}>
      {mode === "grid"     && <WeatherGrid     data={data} />}
      {mode === "expanded" && <WeatherExpanded data={data} />}
    </WidgetWrapper>
  );
}

// ── Vue grille ────────────────────────────────────────────────────────────────

function WeatherGrid({ data }: { data: WeatherData }) {
  return (
    <div className="flex flex-col h-full gap-3">
      {/* Ville + condition */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1 text-xs text-muted mb-0.5">
            <MapPin size={10} />
            <span>{data.city}, {data.country}</span>
          </div>
          <p className="text-xs text-muted/70">{data.condition}</p>
        </div>
        <span className="text-3xl leading-none">{data.icon}</span>
      </div>

      {/* Température principale */}
      <div className="flex items-end gap-2">
        <span className="text-4xl font-bold text-primary tabular-nums leading-none">
          {Math.round(data.temperature)}°
        </span>
        <span className="text-xs text-muted mb-1">
          Ressenti {Math.round(data.feelsLike)}°
        </span>
      </div>

      {/* Stats rapides */}
      <div className="flex gap-3 mt-auto">
        <div className="flex items-center gap-1 text-xs text-muted">
          <Droplets size={11} className="text-cyan-400" />
          {data.humidity}%
        </div>
        <div className="flex items-center gap-1 text-xs text-muted">
          <Wind size={11} className="text-blue-400" />
          {data.windSpeed} km/h
        </div>
      </div>
    </div>
  );
}

// ── Vue expanded ──────────────────────────────────────────────────────────────

function WeatherExpanded({ data }: { data: WeatherData }) {
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Hero */}
      <div className="flex items-center justify-between p-5 bg-surface-2 rounded-2xl">
        <div>
          <div className="flex items-center gap-1.5 text-sm text-muted mb-1">
            <MapPin size={13} />
            <span>{data.city}, {data.country}</span>
          </div>
          <p className="text-5xl font-bold text-primary tabular-nums">
            {Math.round(data.temperature)}°C
          </p>
          <p className="text-base text-muted mt-1">{data.condition}</p>
        </div>
        <span className="text-7xl">{data.icon}</span>
      </div>

      {/* Détails */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <Thermometer size={16} className="text-orange-400" />, label: "Ressenti", value: `${Math.round(data.feelsLike)}°C` },
          { icon: <Droplets size={16} className="text-cyan-400" />, label: "Humidité", value: `${data.humidity}%` },
          { icon: <Wind size={16} className="text-blue-400" />, label: "Vent", value: `${data.windSpeed} km/h` },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-2 p-3 bg-surface-2 rounded-xl">
            {item.icon}
            <span className="text-lg font-semibold text-primary">{item.value}</span>
            <span className="text-xs text-muted">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Prévisions 5 jours */}
      <div>
        <p className="text-xs font-medium text-muted uppercase tracking-wider mb-3">
          Prévisions 5 jours
        </p>
        <div className="flex flex-col gap-1.5">
          {data.forecast.map((day) => {
            const range = day.tempMax - day.tempMin || 1;
            return (
              <div key={day.date} className="flex items-center gap-4 px-3 py-2.5 rounded-lg bg-surface-2">
                <span className="text-sm text-muted w-10 shrink-0">{day.label}</span>
                <span className="text-xl w-8 text-center">{day.icon}</span>
                <span className="text-xs text-muted flex-1 truncate">{day.condition}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted/60 w-8 text-right tabular-nums">{day.tempMin}°</span>
                  {/* Barre de température */}
                  <div className="w-20 h-1.5 bg-surface rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-orange-400"
                      style={{ width: `${Math.max(20, ((day.tempMax - day.tempMin) / range) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-primary w-8 tabular-nums">{day.tempMax}°</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
