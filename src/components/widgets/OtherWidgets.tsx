import React, { useState, useEffect } from "react";
import { ExternalLink, Rss, Pin, Calendar as CalIcon } from "lucide-react";
import type { WidgetConfig, DisplayMode, RssData, NoteData, CalendarData } from "../../types";
import { WidgetWrapper } from "./WidgetWrapper";
import { useWidgetStore } from "../../hooks/useWidgetStore";
import { formatRelativeTime, formatDate } from "../../services/utils";

interface CommonProps {
  config: WidgetConfig;
  mode: DisplayMode;
  onAdminEdit?: () => void;
  dragHandleProps?: Record<string, unknown>;
  widgetDragProps?: Record<string, unknown>;
}


export function RssWidget({ config, mode, onAdminEdit, dragHandleProps, widgetDragProps }: CommonProps) {
  const data = config.data as unknown as RssData;
  return (
    <WidgetWrapper config={config} mode={mode} onAdminEdit={onAdminEdit}
      dragHandleProps={dragHandleProps} widgetDragProps={widgetDragProps}>
      {mode === "grid" && (
        <div className="flex flex-col h-full gap-2">
          <div className="flex items-center gap-1.5">
            <Rss size={11} className="text-orange-400" />
            <span className="text-xs text-muted">{data.feedName}</span>
          </div>
          <div className="flex flex-col gap-2 flex-1 overflow-auto">
            {data.items.slice(0, 4).map((item) => (
              <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="border-l-2 border-accent/30 pl-2 hover:border-accent transition-colors group">
                <p className="text-xs text-primary font-medium line-clamp-2 group-hover:text-accent transition-colors">{item.title}</p>
                <p className="text-xs text-muted/60 mt-0.5">{formatRelativeTime(item.pubDate)}</p>
              </a>
            ))}
          </div>
        </div>
      )}
      {mode === "expanded" && (
        <div className="flex flex-col gap-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <Rss size={14} className="text-orange-400" />
            <span className="text-sm font-medium text-primary">{data.feedName}</span>
          </div>
          {data.items.map((item) => (
            <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer"
              className="group flex flex-col gap-1.5 p-3 rounded-lg bg-surface-2 hover:bg-surface
                border border-transparent hover:border-accent/20 transition-all">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-primary group-hover:text-accent transition-colors">{item.title}</p>
                <ExternalLink size={12} className="text-muted/50 group-hover:text-accent shrink-0 mt-0.5 transition-colors" />
              </div>
              <p className="text-xs text-muted line-clamp-2">{item.description}</p>
              <p className="text-xs text-muted/60">{formatRelativeTime(item.pubDate)}</p>
            </a>
          ))}
        </div>
      )}
    </WidgetWrapper>
  );
}



export function ClockWidget({ config, mode, onAdminEdit, dragHandleProps, widgetDragProps }: CommonProps) {
  const data = config.data as any;
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = (tz: string) =>
    new Intl.DateTimeFormat("fr-FR", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: data.format === "12h" }).format(now);
  const fmtDate = (tz: string) =>
    new Intl.DateTimeFormat("fr-FR", { timeZone: tz, weekday: "short", day: "numeric", month: "short" }).format(now);

  const primary = data.clocks?.[0] ?? { label: "Paris", timezone: "Europe/Paris" };

  return (
    <WidgetWrapper config={config} mode={mode} onAdminEdit={onAdminEdit}
      dragHandleProps={dragHandleProps} widgetDragProps={widgetDragProps}>
      {mode === "grid" && (
        <div className="flex flex-col items-center justify-center h-full gap-1">
          <p className="text-2xl font-bold text-primary tabular-nums tracking-tight">{fmt(primary.timezone)}</p>
          <p className="text-xs text-muted">{fmtDate(primary.timezone)}</p>
          <p className="text-xs text-muted/50">{primary.label}</p>
        </div>
      )}
      {mode === "expanded" && (
        <div className="flex flex-col gap-4 max-w-lg mx-auto">
          <div className="text-center py-4">
            <p className="text-5xl font-bold text-primary tabular-nums tracking-tight">{fmt(primary.timezone)}</p>
            <p className="text-sm text-muted mt-2">{fmtDate(primary.timezone)} · {primary.label}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(data.clocks ?? []).slice(1).map((c: any, i: number) => (
              <div key={i} className="bg-surface-2 rounded-lg p-3 text-center">
                <p className="text-xs text-muted mb-1">{c.label}</p>
                <p className="text-lg font-semibold text-primary tabular-nums">{fmt(c.timezone)}</p>
                <p className="text-xs text-muted/60 mt-0.5">{fmtDate(c.timezone)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </WidgetWrapper>
  );
}



export function NoteWidget({ config, mode, onAdminEdit, dragHandleProps, widgetDragProps }: CommonProps) {
  const updateWidgetData = useWidgetStore((s) => s.updateWidgetData);
  const data = config.data as unknown as NoteData;

  const [draft, setDraft] = useState(data.content);

  const save = () => updateWidgetData(config.id, { content: draft });

  const lines = (draft || "").split("\n").filter(Boolean);

  return (
    <WidgetWrapper config={config} mode={mode} onAdminEdit={onAdminEdit}
      dragHandleProps={dragHandleProps} widgetDragProps={widgetDragProps}>

      {mode === "grid" && (
        
        <div className="flex flex-col h-full gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: data.color }} />
            {data.pinned && <Pin size={10} className="text-muted" />}
          </div>
          <textarea
            value={draft}
            onChange={(e) => { e.stopPropagation(); setDraft(e.target.value); }}
            onBlur={save}
            onClick={(e) => e.stopPropagation()}
            placeholder="Écrivez ici..."
            className="flex-1 w-full bg-transparent text-xs text-primary resize-none
              focus:outline-none placeholder:text-muted/30 leading-relaxed"
          />
        </div>
      )}

      {mode === "expanded" && (
        <div className="flex flex-col gap-3 h-full max-w-2xl mx-auto">
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: data.color }} />
              {data.pinned && <Pin size={12} className="text-muted" />}
            </div>
            <button onClick={save}
              className="text-xs px-2.5 py-1 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors">
              Sauvegarder
            </button>
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Écrivez votre note en Markdown..."
            className="flex-1 w-full bg-surface-2 border border-border rounded-lg p-3
              text-sm text-primary font-mono resize-none focus:outline-none
              focus:ring-2 focus:ring-accent/40 leading-relaxed"
            style={{ minHeight: "200px" }}
          />
        </div>
      )}
    </WidgetWrapper>
  );
}



export function CalendarWidget({ config, mode, onAdminEdit, dragHandleProps, widgetDragProps }: CommonProps) {
  const data = config.data as unknown as CalendarData;
  const now = new Date();
  const upcoming = [...data.events]
    .filter((e) => new Date(e.date) >= new Date(now.toDateString()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <WidgetWrapper config={config} mode={mode} onAdminEdit={onAdminEdit}
      dragHandleProps={dragHandleProps} widgetDragProps={widgetDragProps}>
      {mode === "grid" && (
        <div className="flex flex-col gap-2 h-full">
          <div className="flex items-center gap-1.5 shrink-0">
            <CalIcon size={11} className="text-accent" />
            <span className="text-xs text-muted">Prochains événements</span>
          </div>
          <div className="flex flex-col gap-2 flex-1 overflow-auto">
            {upcoming.slice(0, 4).map((ev) => (
              <div key={ev.id} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1" style={{ background: ev.color }} />
                <div className="min-w-0">
                  <p className="text-xs text-primary font-medium truncate">{ev.title}</p>
                  <p className="text-xs text-muted/60">{ev.time && `${ev.time} · `}{formatDate(ev.date)}</p>
                </div>
              </div>
            ))}
            {upcoming.length === 0 && (
              <p className="text-xs text-muted/40 text-center py-4">Aucun événement à venir</p>
            )}
          </div>
        </div>
      )}
      {mode === "expanded" && (
        <div className="flex flex-col gap-3 max-w-2xl mx-auto">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Agenda</p>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">Aucun événement à venir</p>
          ) : (
            upcoming.map((ev) => (
              <div key={ev.id} className="flex gap-3 p-3 rounded-lg bg-surface-2 border border-border/50">
                <div className="w-1 rounded-full shrink-0 self-stretch" style={{ background: ev.color }} />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-primary">{ev.title}</p>
                    <span className="text-xs text-muted shrink-0">{ev.time}</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">{formatDate(ev.date)}</p>
                  {ev.description && (
                    <p className="text-xs text-muted/70 mt-1.5 leading-relaxed">{ev.description}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </WidgetWrapper>
  );
}
