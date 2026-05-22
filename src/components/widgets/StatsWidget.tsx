import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { WidgetConfig, DisplayMode, StatsData, StatMetric } from "../../types";
import { WidgetWrapper } from "./WidgetWrapper";
import { formatNumber } from "../../services/utils";

interface StatsWidgetProps {
  config: WidgetConfig;
  mode: DisplayMode;
  onAdminEdit?: () => void;
  dragHandleProps?: Record<string, unknown>;
  widgetDragProps?: Record<string, unknown>;
}

export function StatsWidget({ config, mode, onAdminEdit, dragHandleProps, widgetDragProps }: StatsWidgetProps) {
  const data = config.data as unknown as StatsData;
  return (
    <WidgetWrapper config={config} mode={mode} onAdminEdit={onAdminEdit}
      dragHandleProps={dragHandleProps} widgetDragProps={widgetDragProps}>
      {mode === "grid"     && <StatsGrid     metrics={data.metrics} />}
      {mode === "expanded" && <StatsExpanded metrics={data.metrics} />}
    </WidgetWrapper>
  );
}

function MiniChart({ history, positive }: { history: number[]; positive: boolean }) {
  const W = 60, H = 20;
  const min = Math.min(...history), max = Math.max(...history), range = max - min || 1;
  const pts = history.map((v, i) => {
    const x = (i / (history.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x},${y}`;
  });
  const color = positive ? "#10b981" : "#ef4444";
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
      <path d={`M ${pts.join(" L ")}`} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MetricCard({ metric, compact }: { metric: StatMetric; compact?: boolean }) {
  const isUp = metric.trend === "up", isDown = metric.trend === "down";
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const trendColor = isUp ? "text-emerald-400" : isDown ? "text-red-400" : "text-muted";
  const positive = metric.trendValue >= 0;
  return (
    <div className={`bg-surface-2 rounded-lg ${compact ? "p-2.5" : "p-4"}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted mb-1">{metric.label}</p>
          <p className={`font-bold text-primary tabular-nums ${compact ? "text-base" : "text-2xl"}`}>
            {formatNumber(metric.value)}
            {metric.unit && <span className="text-xs font-normal text-muted ml-1">{metric.unit}</span>}
          </p>
        </div>
        {!compact && <MiniChart history={metric.history} positive={positive} />}
      </div>
      <div className={`flex items-center gap-1 mt-1 ${trendColor}`}>
        <TrendIcon size={11} />
        <span className="text-xs tabular-nums">
          {metric.trendValue > 0 ? "+" : ""}{metric.trendValue.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

function StatsGrid({ metrics }: { metrics: StatMetric[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 h-full content-start">
      {metrics.slice(0, 4).map((m) => <MetricCard key={m.id} metric={m} compact />)}
    </div>
  );
}

function StatsExpanded({ metrics }: { metrics: StatMetric[] }) {
  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => <MetricCard key={m.id} metric={m} />)}
      </div>
      <div className="border-t border-border pt-4">
        <p className="text-xs font-medium text-muted uppercase tracking-wider mb-3">Tendances (7 jours)</p>
        <div className="flex flex-col gap-3">
          {metrics.map((m) => {
            const min = Math.min(...m.history), max = Math.max(...m.history), range = max - min || 1;
            const positive = m.trendValue >= 0;
            const W = 280, H = 50;
            const pts = m.history.map((v, i) => {
              const x = (i / (m.history.length - 1)) * W;
              const y = H - ((v - min) / range) * H * 0.8 - H * 0.1;
              return `${x},${y}`;
            });
            const color = positive ? "#10b981" : "#ef4444";
            return (
              <div key={m.id} className="flex items-center gap-3">
                <div className="w-24 shrink-0">
                  <p className="text-xs text-muted">{m.label}</p>
                  <p className="text-sm font-semibold text-primary">{formatNumber(m.value)}{m.unit}</p>
                </div>
                <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} fill="none" className="flex-1">
                  <path d={`M ${pts.join(" L ")} L ${W},${H} L 0,${H} Z`} fill={color} fillOpacity="0.08" />
                  <path d={`M ${pts.join(" L ")}`} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  {m.history.map((v, i) => {
                    const x = (i / (m.history.length - 1)) * W;
                    const y = H - ((v - min) / range) * H * 0.8 - H * 0.1;
                    return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />;
                  })}
                </svg>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
