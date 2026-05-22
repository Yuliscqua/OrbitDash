import React from "react";
import type { WidgetConfig, DisplayMode } from "../../types";
import { PollWidget }     from "./PollWidget";
import { CryptoWidget }   from "./CryptoWidget";
import { StatsWidget }    from "./StatsWidget";
import { WeatherWidget }  from "./WeatherWidget";
import { PomodoroWidget } from "./PomodoroWidget";
import { StocksWidget }   from "./StocksWidget";
import { RssWidget, ClockWidget, NoteWidget, CalendarWidget } from "./OtherWidgets";

interface WidgetRendererProps {
  config: WidgetConfig;
  mode: DisplayMode;
  onAdminEdit?: () => void;
  dragHandleProps?: Record<string, unknown>;
  widgetDragProps?: Record<string, unknown>;
}

export function WidgetRenderer({ config, mode, onAdminEdit, dragHandleProps, widgetDragProps }: WidgetRendererProps) {
  const props = { config, mode, onAdminEdit, dragHandleProps, widgetDragProps };

  switch (config.type) {
    case "poll":     return <PollWidget     {...props} />;
    case "crypto":   return <CryptoWidget   {...props} />;
    case "stats":    return <StatsWidget    {...props} />;
    case "rss":      return <RssWidget      {...props} />;
    case "clock":    return <ClockWidget    {...props} />;
    case "note":     return <NoteWidget     {...props} />;
    case "calendar": return <CalendarWidget {...props} />;
    case "weather":  return <WeatherWidget  {...props} />;
    case "pomodoro": return <PomodoroWidget {...props} />;
    case "stocks":   return <StocksWidget   {...props} />;
    default:
      return (
        <div className="flex items-center justify-center h-full text-muted text-sm">
          Widget inconnu : {config.type}
        </div>
      );
  }
}
