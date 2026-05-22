import React, { useState } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";
import type { WidgetConfig, PollData, RssData, CalendarData, PollOption } from "../../types";
import { useWidgetStore } from "../../hooks/useWidgetStore";
import { Button, Input, Textarea, Select, Toggle } from "../ui";
import { generateId } from "../../services/utils";

interface AdminWidgetPanelProps {
  widget: WidgetConfig;
  onClose: () => void;
}

export function AdminWidgetPanel({ widget, onClose }: AdminWidgetPanelProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-border rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-base font-semibold text-primary">Configurer le widget</h2>
            <p className="text-xs text-muted mt-0.5">{widget.title} · {widget.type}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-2 text-muted hover:text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-5">
          <WidgetEditor widget={widget} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}

function WidgetEditor({ widget, onClose }: { widget: WidgetConfig; onClose: () => void }) {
  const { updateWidget, updateWidgetData } = useWidgetStore();
  const [title, setTitle] = useState(widget.title);
  const [focusable, setFocusable] = useState(widget.focusable);

  const save = (extraData?: Record<string, unknown>) => {
    updateWidget(widget.id, { title, focusable });
    if (extraData) updateWidgetData(widget.id, extraData);
    onClose();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <Input
          label="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Toggle
          checked={focusable}
          onChange={setFocusable}
          label="Widget focusable (zone centrale)"
        />
      </div>

      <div className="border-t border-border pt-4">
        {widget.type === "poll"     && <PollEditor     widget={widget} onSave={save} />}
        {widget.type === "rss"      && <RssEditor      widget={widget} onSave={save} />}
        {widget.type === "note"     && <NoteEditor     widget={widget} onSave={save} />}
        {widget.type === "crypto"   && <CryptoEditor   widget={widget} onSave={save} />}
        {widget.type === "calendar" && <CalendarEditor widget={widget} onSave={save} />}
        {widget.type === "weather"  && <WeatherEditor  widget={widget} onSave={save} />}
        {widget.type === "pomodoro" && <PomodoroEditor widget={widget} onSave={save} />}
        {widget.type === "stocks"   && <StocksEditor   widget={widget} onSave={save} />}
        {(widget.type === "clock" || widget.type === "stats") && (
          <Button onClick={() => save()} className="w-full mt-2" icon={<Save size={14} />}>
            Sauvegarder
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Poll Editor ──────────────────────────────────────────────────────────────

function PollEditor({ widget, onSave }: { widget: WidgetConfig; onSave: (d: Record<string, unknown>) => void }) {
  const data = widget.data as unknown as PollData;
  const [question, setQuestion] = useState(data.question);
  const [options, setOptions] = useState<PollOption[]>(data.options);

  const addOption = () =>
    setOptions([...options, { id: generateId(), text: "", votes: 0 }]);
  const removeOption = (id: string) =>
    setOptions(options.filter((o) => o.id !== id));
  const updateOption = (id: string, text: string) =>
    setOptions(options.map((o) => (o.id === id ? { ...o, text } : o)));

  return (
    <div className="flex flex-col gap-3">
      <Input
        label="Question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted uppercase tracking-wider">Options</label>
        {options.map((opt) => (
          <div key={opt.id} className="flex items-center gap-2">
            <Input
              value={opt.text}
              onChange={(e) => updateOption(opt.id, e.target.value)}
              placeholder="Option..."
              className="flex-1"
            />
            <button
              onClick={() => removeOption(opt.id)}
              className="p-2 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          onClick={addOption}
          className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 py-1.5 transition-colors"
        >
          <Plus size={12} /> Ajouter une option
        </button>
      </div>
      <Button
        onClick={() => onSave({ question, options, userVote: null })}
        className="w-full mt-2"
        icon={<Save size={14} />}
      >
        Sauvegarder
      </Button>
    </div>
  );
}

// ─── RSS Editor ───────────────────────────────────────────────────────────────

function RssEditor({ widget, onSave }: { widget: WidgetConfig; onSave: (d: Record<string, unknown>) => void }) {
  const data = widget.data as unknown as RssData;
  const [feedUrl, setFeedUrl] = useState(data.feedUrl);
  const [feedName, setFeedName] = useState(data.feedName);

  return (
    <div className="flex flex-col gap-3">
      <Input
        label="Nom du flux"
        value={feedName}
        onChange={(e) => setFeedName(e.target.value)}
      />
      <Input
        label="URL du flux RSS"
        value={feedUrl}
        onChange={(e) => setFeedUrl(e.target.value)}
        placeholder="https://example.com/feed.xml"
      />
      <p className="text-xs text-muted/60">Les articles seront rechargés automatiquement.</p>
      <Button
        onClick={() => onSave({ feedUrl, feedName })}
        className="w-full mt-2"
        icon={<Save size={14} />}
      >
        Sauvegarder
      </Button>
    </div>
  );
}

// ─── Note Editor ──────────────────────────────────────────────────────────────

interface NoteData { content: string; color: string; pinned: boolean }

function NoteEditor({ widget, onSave }: { widget: WidgetConfig; onSave: (d: Record<string, unknown>) => void }) {
  const data = widget.data as unknown as NoteData;
  const [content, setContent] = useState(data.content);
  const [color, setColor]     = useState(data.color);
  const [pinned, setPinned]   = useState(data.pinned);
  const colors = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#ef4444", "#ec4899"];

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        label="Contenu (Markdown)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted uppercase tracking-wider">Couleur</label>
        <div className="flex gap-2">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full transition-transform ${color === c ? "scale-125 ring-2 ring-offset-2 ring-offset-surface" : ""}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
      <Toggle checked={pinned} onChange={setPinned} label="Épingler cette note" />
      <Button
        onClick={() => onSave({ content, color, pinned })}
        className="w-full mt-2"
        icon={<Save size={14} />}
      >
        Sauvegarder
      </Button>
    </div>
  );
}

// ─── Crypto Editor ────────────────────────────────────────────────────────────

interface CryptoEditorData { currency: string }

function CryptoEditor({ widget, onSave }: { widget: WidgetConfig; onSave: (d: Record<string, unknown>) => void }) {
  const data = widget.data as unknown as CryptoEditorData;
  const [currency, setCurrency] = useState(data.currency);

  return (
    <div className="flex flex-col gap-3">
      <Select
        label="Devise d'affichage"
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        options={[
          { value: "EUR", label: "EUR — Euro" },
          { value: "USD", label: "USD — Dollar" },
          { value: "GBP", label: "GBP — Livre sterling" },
          { value: "CHF", label: "CHF — Franc suisse" },
        ]}
      />
      <Button onClick={() => onSave({ currency })} className="w-full mt-2" icon={<Save size={14} />}>
        Sauvegarder
      </Button>
    </div>
  );
}

// ─── Calendar Editor ─────────────────────────────────────────────────────────

function CalendarEditor({ widget, onSave }: { widget: WidgetConfig; onSave: (d: Record<string, unknown>) => void }) {
  const data = widget.data as unknown as CalendarData;
  const [events, setEvents]   = useState(data.events ?? []);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate]   = useState("");
  const [newTime, setNewTime]   = useState("");

  const addEvent = () => {
    if (!newTitle || !newDate) return;
    const palette = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#ef4444"];
    const ev = {
      id:    generateId(),
      title: newTitle,
      date:  newDate,
      time:  newTime,
      color: palette[events.length % palette.length],
    };
    setEvents([...events, ev]);
    setNewTitle(""); setNewDate(""); setNewTime("");
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium text-muted uppercase tracking-wider">Événements</p>
      {events.map((ev) => (
        <div key={ev.id} className="flex items-center gap-2 p-2 bg-surface-2 rounded-lg">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: ev.color }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-primary truncate">{ev.title}</p>
            <p className="text-xs text-muted">{ev.date} {ev.time}</p>
          </div>
          <button
            onClick={() => setEvents(events.filter((e) => e.id !== ev.id))}
            className="p-1 text-red-400/60 hover:text-red-400 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <div className="flex flex-col gap-2 p-3 border border-dashed border-border rounded-lg">
        <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Titre de l'événement" />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="bg-surface-2 border border-border rounded-lg px-2 py-2 text-xs text-primary"
          />
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="bg-surface-2 border border-border rounded-lg px-2 py-2 text-xs text-primary"
          />
        </div>
        <Button size="sm" variant="outline" onClick={addEvent} icon={<Plus size={12} />}>
          Ajouter
        </Button>
      </div>
      <Button onClick={() => onSave({ events })} className="w-full mt-2" icon={<Save size={14} />}>
        Sauvegarder
      </Button>
    </div>
  );
}

// ─── Weather Editor ───────────────────────────────────────────────────────────

interface WeatherEditorData { city: string; country: string }

function WeatherEditor({ widget, onSave }: { widget: WidgetConfig; onSave: (d: Record<string, unknown>) => void }) {
  const data = widget.data as unknown as WeatherEditorData;
  const [city, setCity]       = useState(data.city ?? "Paris");
  const [country, setCountry] = useState(data.country ?? "FR");

  return (
    <div className="flex flex-col gap-3">
      <Input label="Ville" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Paris" />
      <Input label="Pays (code ISO)" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="FR" />
      <p className="text-xs text-muted/60">
        Les données météo sont simulées. Connectez une API (ex : OpenWeatherMap) pour des données réelles.
      </p>
      <Button onClick={() => onSave({ ...widget.data, city, country })} className="w-full mt-2" icon={<Save size={14} />}>
        Sauvegarder
      </Button>
    </div>
  );
}

// ─── Pomodoro Editor ──────────────────────────────────────────────────────────

interface PomodoroEditorData { workDuration: number; shortBreakDuration: number; longBreakDuration: number; sessionsUntilLongBreak: number; label: string }

function PomodoroEditor({ widget, onSave }: { widget: WidgetConfig; onSave: (d: Record<string, unknown>) => void }) {
  const data = widget.data as unknown as PomodoroEditorData;
  const [work,    setWork]    = useState(String(data.workDuration ?? 25));
  const [short_,  setShort]   = useState(String(data.shortBreakDuration ?? 5));
  const [long_,   setLong]    = useState(String(data.longBreakDuration ?? 15));
  const [until,   setUntil]   = useState(String(data.sessionsUntilLongBreak ?? 4));
  const [label,   setLabel]   = useState(data.label ?? "");

  return (
    <div className="flex flex-col gap-3">
      <Input label="Tâche en cours" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex : Développer la feature X" />
      <div className="grid grid-cols-2 gap-2">
        <Input label="Travail (min)" type="number" value={work}   onChange={(e) => setWork(e.target.value)}   />
        <Input label="Petite pause (min)" type="number" value={short_} onChange={(e) => setShort(e.target.value)} />
        <Input label="Grande pause (min)" type="number" value={long_}  onChange={(e) => setLong(e.target.value)}  />
        <Input label="Sessions avant grande pause" type="number" value={until} onChange={(e) => setUntil(e.target.value)} />
      </div>
      <Button
        onClick={() => onSave({
          workDuration: parseInt(work, 10),
          shortBreakDuration: parseInt(short_, 10),
          longBreakDuration: parseInt(long_, 10),
          sessionsUntilLongBreak: parseInt(until, 10),
          label,
        })}
        className="w-full mt-2" icon={<Save size={14} />}>
        Sauvegarder
      </Button>
    </div>
  );
}

// ─── Stocks Editor ────────────────────────────────────────────────────────────

interface StocksEditorData { market: string }

function StocksEditor({ widget, onSave }: { widget: WidgetConfig; onSave: (d: Record<string, unknown>) => void }) {
  const data = widget.data as unknown as StocksEditorData;
  const [market, setMarket] = useState(data.market ?? "NASDAQ");

  return (
    <div className="flex flex-col gap-3">
      <Select
        label="Marché"
        value={market}
        onChange={(e) => setMarket(e.target.value)}
        options={[
          { value: "NASDAQ",   label: "NASDAQ — Tech US" },
          { value: "NYSE",     label: "NYSE — New York" },
          { value: "EURONEXT", label: "Euronext — Paris" },
          { value: "LSE",      label: "LSE — Londres" },
        ]}
      />
      <p className="text-xs text-muted/60">
        Les cours sont simulés. Connectez une API (ex : Alpha Vantage) pour des données réelles.
      </p>
      <Button onClick={() => onSave({ ...widget.data, market })} className="w-full mt-2" icon={<Save size={14} />}>
        Sauvegarder
      </Button>
    </div>
  );
}
