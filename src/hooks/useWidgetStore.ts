import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WidgetConfig, WidgetType } from "../types";
import { generateId } from "../services/utils";
import { DEFAULT_WIDGETS } from "../services/defaultWidgets";

interface WidgetStore {
  widgets: WidgetConfig[];
  expandedWidgetId: string | null;          // widget dans le slot central
  isAdminLayoutMode: boolean;

  setExpanded: (id: string | null) => void;
  toggleAdminLayoutMode: () => void;
  updateWidgetData: (id: string, data: Partial<WidgetConfig["data"]>) => void;
  updateWidget: (id: string, updates: Partial<WidgetConfig>) => void;
  addWidget: (type: WidgetType, title: string, position?: number) => void;
  removeWidget: (id: string) => void;
  swapWidgets: (aId: string, bId: string) => void;
  reorderWidgets: (orderedIds: string[]) => void;
  resetWidgets: () => void;
}

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set, get) => ({
      widgets: DEFAULT_WIDGETS,
      expandedWidgetId: null,
      isAdminLayoutMode: false,

      setExpanded: (id) => set({ expandedWidgetId: id }),

      toggleAdminLayoutMode: () =>
        set((s) => ({ isAdminLayoutMode: !s.isAdminLayoutMode })),

      updateWidgetData: (id, data) =>
        set((s) => ({
          widgets: s.widgets.map((w) =>
            w.id === id
              ? { ...w, data: { ...w.data, ...data }, updatedAt: new Date().toISOString() }
              : w
          ),
        })),

      updateWidget: (id, updates) =>
        set((s) => ({
          widgets: s.widgets.map((w) =>
            w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
          ),
        })),

      addWidget: (type, title, position) => {
        const widgets = get().widgets;
        const pos = position ?? widgets.length;
        const newWidget: WidgetConfig = {
          id: generateId(),
          type,
          title,
          position: pos,
          size: "medium",
          focusable: true,
          data: getDefaultData(type),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ widgets: [...s.widgets, newWidget] }));
      },

      removeWidget: (id) =>
        set((s) => ({
          widgets: s.widgets
            .filter((w) => w.id !== id)
            .map((w, i) => ({ ...w, position: i })),
          expandedWidgetId: s.expandedWidgetId === id ? null : s.expandedWidgetId,
        })),

      swapWidgets: (aId, bId) =>
        set((s) => {
          const widgets = [...s.widgets];
          const aIdx = widgets.findIndex((w) => w.id === aId);
          const bIdx = widgets.findIndex((w) => w.id === bId);
          if (aIdx === -1 || bIdx === -1) return s;
          const aPos = widgets[aIdx].position;
          const bPos = widgets[bIdx].position;
          widgets[aIdx] = { ...widgets[aIdx], position: bPos };
          widgets[bIdx] = { ...widgets[bIdx], position: aPos };
          return { widgets };
        }),

      reorderWidgets: (orderedIds) =>
        set((s) => ({
          widgets: orderedIds.map((id, i) => {
            const w = s.widgets.find((w) => w.id === id)!;
            return { ...w, position: i };
          }),
        })),

      resetWidgets: () => set({ widgets: DEFAULT_WIDGETS, expandedWidgetId: null }),
    }),
    { name: "orbitdash-widgets" }
  )
);

function getDefaultData(type: WidgetType): Record<string, unknown> {
  switch (type) {
    case "note":
      return { content: "Nouvelle note...", color: "#6366f1", pinned: false };
    case "poll":
      return {
        question: "Nouvelle question ?",
        options: [
          { id: generateId(), text: "Option A", votes: 0 },
          { id: generateId(), text: "Option B", votes: 0 },
        ],
      };
    case "clock":
      return { timezone: "Europe/Paris", format: "24h" };
    case "rss":
      return { feedUrl: "https://feeds.bbci.co.uk/news/rss.xml", feedName: "BBC News", items: [] };
    case "crypto":
      return { assets: [], currency: "USD" };
    case "stats":
      return { metrics: [] };
    case "calendar":
      return { events: [] };
    case "weather":
      return {
        city: "Paris", country: "FR",
        temperature: 18, feelsLike: 16, humidity: 60, windSpeed: 12,
        condition: "Ensoleillé", icon: "☀️",
        forecast: [
          { date: "2025-05-21", label: "Auj.", icon: "☀️",  tempMin: 13, tempMax: 20, condition: "Ensoleillé" },
          { date: "2025-05-22", label: "Dem.", icon: "⛅", tempMin: 12, tempMax: 18, condition: "Nuageux" },
        ],
      };
    case "pomodoro":
      return { workDuration: 25, shortBreakDuration: 5, longBreakDuration: 15, sessionsUntilLongBreak: 4, label: "" };
    case "stocks":
      return { market: "NASDAQ", assets: [] };
    default:
      return {};
  }
}
