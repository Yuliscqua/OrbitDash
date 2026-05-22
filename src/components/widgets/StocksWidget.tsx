import React, { useEffect } from "react";
import { TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import type { WidgetConfig, DisplayMode, StocksData, StockAsset } from "../../types";
import { WidgetWrapper } from "./WidgetWrapper";
import { useWidgetStore } from "../../hooks/useWidgetStore";

interface StocksWidgetProps {
  config: WidgetConfig;
  mode: DisplayMode;
  onAdminEdit?: () => void;
  dragHandleProps?: Record<string, unknown>;
  widgetDragProps?: Record<string, unknown>;
}

// ── Simulation temps réel ─────────────────────────────────────────────────────

function useStocksSimulation(config: WidgetConfig) {
  const updateWidgetData = useWidgetStore((s) => s.updateWidgetData);
  const data = config.data as unknown as StocksData;

  useEffect(() => {
    const id = setInterval(() => {
      const updated = data.assets.map((asset) => {
        const drift = (Math.random() - 0.496) * 0.004;
        const newPrice = Math.max(0.01, asset.price * (1 + drift));
        const newChange = asset.change + (newPrice - asset.price);
        const newPct = (newChange / (newPrice - newChange)) * 100;
        const newSparkline = [...asset.sparkline.slice(1), newPrice];
        return {
          ...asset,
          price: Math.round(newPrice * 100) / 100,
          change: Math.round(newChange * 100) / 100,
          changePercent: Math.round(newPct * 100) / 100,
          sparkline: newSparkline,
        };
      });
      updateWidgetData(config.id, { assets: updated });
    }, 4000);
    return () => clearInterval(id);
  }, [data.assets]);
}

export function StocksWidget({ config, mode, onAdminEdit, dragHandleProps, widgetDragProps }: StocksWidgetProps) {
  const data = config.data as unknown as StocksData;
  useStocksSimulation(config);

  return (
    <WidgetWrapper config={config} mode={mode} onAdminEdit={onAdminEdit}
      dragHandleProps={dragHandleProps} widgetDragProps={widgetDragProps}>
      {mode === "grid"     && <StocksGrid     data={data} />}
      {mode === "expanded" && <StocksExpanded data={data} />}
    </WidgetWrapper>
  );
}

// ── Sparkline SVG ─────────────────────────────────────────────────────────────

function Sparkline({ values, positive, width = 56, height = 22 }: {
  values: number[]; positive: boolean; width?: number; height?: number;
}) {
  if (values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  const color = positive ? "#10b981" : "#ef4444";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <path d={`M ${pts.join(" L ")} L ${width},${height} L 0,${height} Z`} fill={color} fillOpacity="0.1" />
      <path d={`M ${pts.join(" L ")}`} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Ligne d'action ────────────────────────────────────────────────────────────

function StockRow({ asset, showSparkline }: { asset: StockAsset; showSparkline?: boolean }) {
  const pos = asset.changePercent >= 0;
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
      {/* Logo/symbole */}
      <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center shrink-0 border border-border/50">
        <span className="text-xs font-bold text-primary">{asset.symbol.slice(0, 2)}</span>
      </div>

      {/* Nom */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-primary truncate">{asset.symbol}</p>
        {showSparkline && <p className="text-xs text-muted truncate">{asset.name}</p>}
      </div>

      {/* Sparkline */}
      {showSparkline && <Sparkline values={asset.sparkline} positive={pos} />}

      {/* Prix + variation */}
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-primary tabular-nums">
          {asset.price.toFixed(2)} {asset.currency}
        </p>
        <div className={`flex items-center justify-end gap-0.5 text-xs tabular-nums
          ${pos ? "text-emerald-400" : "text-red-400"}`}>
          {pos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {pos ? "+" : ""}{asset.changePercent.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

// ── Vue grille ────────────────────────────────────────────────────────────────

function StocksGrid({ data }: { data: StocksData }) {
  const gainers = data.assets.filter((a) => a.changePercent >= 0).length;
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-muted">{data.market} · Live</span>
        </div>
        <span className="text-xs text-muted">{gainers}/{data.assets.length} 📈</span>
      </div>
      <div className="flex-1 overflow-auto">
        {data.assets.map((a) => <StockRow key={a.id} asset={a} />)}
      </div>
    </div>
  );
}

// ── Vue expanded ──────────────────────────────────────────────────────────────

function StocksExpanded({ data }: { data: StocksData }) {
  const gainers = data.assets.filter((a) => a.changePercent >= 0);
  const losers  = data.assets.filter((a) => a.changePercent < 0);
  const best    = [...data.assets].sort((a, b) => b.changePercent - a.changePercent)[0];
  const worst   = [...data.assets].sort((a, b) => a.changePercent - b.changePercent)[0];

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto">
      {/* En-tête marché */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-2 rounded-xl">
        <div className="flex items-center gap-2">
          <BarChart2 size={16} className="text-accent" />
          <span className="text-sm font-semibold text-primary">{data.market}</span>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-muted">Temps réel simulé</span>
          </div>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="text-emerald-400">↑ {gainers.length} hausse{gainers.length > 1 ? "s" : ""}</span>
          <span className="text-red-400">↓ {losers.length} baisse{losers.length > 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Tops */}
      {best && worst && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
            <p className="text-xs text-muted mb-1">Meilleure performance</p>
            <p className="text-base font-bold text-primary">{best.symbol}</p>
            <p className="text-sm text-emerald-400 font-semibold">+{best.changePercent.toFixed(2)}%</p>
          </div>
          <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
            <p className="text-xs text-muted mb-1">Plus forte baisse</p>
            <p className="text-base font-bold text-primary">{worst.symbol}</p>
            <p className="text-sm text-red-400 font-semibold">{worst.changePercent.toFixed(2)}%</p>
          </div>
        </div>
      )}

      {/* Liste complète */}
      <div>
        <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
          Toutes les valeurs ({data.assets.length})
        </p>
        <div className="flex flex-col divide-y divide-border/30">
          {[...data.assets]
            .sort((a, b) => b.changePercent - a.changePercent)
            .map((a) => <StockRow key={a.id} asset={a} showSparkline />)
          }
        </div>
      </div>
    </div>
  );
}
