import React, { useEffect, useRef } from "react";
import { TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import type { WidgetConfig, DisplayMode, CryptoData, CryptoAsset } from "../../types";
import { WidgetWrapper } from "./WidgetWrapper";
import { useWidgetStore } from "../../hooks/useWidgetStore";
import { formatCurrency } from "../../services/utils";

interface CryptoWidgetProps {
  config: WidgetConfig;
  mode: DisplayMode;
  onAdminEdit?: () => void;
  dragHandleProps?: Record<string, unknown>;
  widgetDragProps?: Record<string, unknown>;
}

export function CryptoWidget({ config, mode, onAdminEdit, dragHandleProps, widgetDragProps }: CryptoWidgetProps) {
  const updateWidgetData = useWidgetStore((s) => s.updateWidgetData);
  const data = config.data as unknown as CryptoData;

  useEffect(() => {
    const interval = setInterval(() => {
      const updated = data.assets.map((asset) => {
        const drift = (Math.random() - 0.49) * 0.003;
        const newPrice = asset.price * (1 + drift);
        const newChange = asset.change24h + drift * 100 * 0.1;
        const newSparkline = [...asset.sparkline.slice(1), newPrice];
        return { ...asset, price: newPrice, change24h: newChange, sparkline: newSparkline };
      });
      updateWidgetData(config.id, { assets: updated });
    }, 3000);
    return () => clearInterval(interval);
  }, [data.assets]);

  return (
    <WidgetWrapper config={config} mode={mode} onAdminEdit={onAdminEdit}
      dragHandleProps={dragHandleProps} widgetDragProps={widgetDragProps}>
      {mode === "grid"     && <CryptoGrid     data={data} />}
      {mode === "expanded" && <CryptoExpanded data={data} />}
    </WidgetWrapper>
  );
}

function Sparkline({ values, positive }: { values: number[]; positive: boolean }) {
  const W = 64, H = 24;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(" L ")}`;
  const areaD = `${pathD} L ${W},${H} L 0,${H} Z`;
  const color = positive ? "#10b981" : "#ef4444";
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
      <path d={areaD} fill={color} fillOpacity="0.1" />
      <path d={pathD} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AssetRow({ asset, currency, compact }: { asset: CryptoAsset; currency: string; compact?: boolean }) {
  const pos = asset.change24h >= 0;
  const TrendIcon = pos ? TrendingUp : asset.change24h === 0 ? Minus : TrendingDown;
  const trendColor = pos ? "text-emerald-400" : "text-red-400";
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-accent">{asset.symbol[0]}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary truncate">{compact ? asset.symbol : asset.name}</p>
          {!compact && <p className="text-xs text-muted">{asset.symbol}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {!compact && <Sparkline values={asset.sparkline} positive={pos} />}
        <div className="text-right">
          <p className="text-sm font-semibold text-primary tabular-nums">{formatCurrency(asset.price, currency)}</p>
          <div className={`flex items-center gap-0.5 justify-end ${trendColor}`}>
            <TrendIcon size={11} />
            <span className="text-xs tabular-nums">{Math.abs(asset.change24h).toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CryptoGrid({ data }: { data: CryptoData }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs text-muted">Live · {data.currency}</span>
      </div>
      <div className="flex-1 overflow-auto">
        {data.assets.map((asset) => (
          <AssetRow key={asset.id} asset={asset} currency={data.currency} compact />
        ))}
      </div>
    </div>
  );
}

function CryptoExpanded({ data }: { data: CryptoData }) {
  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-muted">Temps réel · {data.currency}</span>
        </div>
        <RefreshCw size={13} className="text-muted animate-spin-slow" />
      </div>
      <div className="flex flex-col divide-y divide-border/40">
        {data.assets.map((asset) => (
          <AssetRow key={asset.id} asset={asset} currency={data.currency} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 mt-2">
        {data.assets.map((asset) => {
          const pos = asset.change24h >= 0;
          return (
            <div key={asset.id} className="bg-surface-2 rounded-lg p-3 text-center">
              <p className="text-xs text-muted mb-1">{asset.name}</p>
              <p className="text-base font-bold text-primary">{formatCurrency(asset.price, data.currency)}</p>
              <p className={`text-xs mt-0.5 ${pos ? "text-emerald-400" : "text-red-400"}`}>
                {pos ? "+" : ""}{asset.change24h.toFixed(2)}%
              </p>
              <div className="mt-2 flex justify-center">
                <Sparkline values={asset.sparkline} positive={pos} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
