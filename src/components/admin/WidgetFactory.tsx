import React, { useState } from "react";
import { X, BarChart3, Vote, Radio, Bitcoin, Clock, StickyNote, Calendar, Cloud, Timer, TrendingUp } from "lucide-react";
import type { WidgetType } from "../../types";
import { useWidgetStore } from "../../hooks/useWidgetStore";
import { Button, Input, Select } from "../ui";

const WIDGET_TYPES: { type: WidgetType; label: string; description: string; icon: React.ReactNode }[] = [
  { type: "poll",     label: "Sondage",      description: "Vote interactif avec historique",        icon: <Vote size={20} /> },
  { type: "crypto",   label: "Crypto",       description: "Cours des cryptomonnaies en direct",     icon: <Bitcoin size={20} /> },
  { type: "stats",    label: "Statistiques", description: "Métriques et KPIs avec tendances",        icon: <BarChart3 size={20} /> },
  { type: "rss",      label: "Flux RSS",     description: "Agrégateur d'actualités",                icon: <Radio size={20} /> },
  { type: "clock",    label: "Horloge",      description: "Horloge mondiale multi-fuseaux",         icon: <Clock size={20} /> },
  { type: "note",     label: "Note",         description: "Note rapide éditable directement",       icon: <StickyNote size={20} /> },
  { type: "calendar", label: "Agenda",       description: "Événements et rappels",                  icon: <Calendar size={20} /> },
  { type: "weather",  label: "Météo",        description: "Conditions météo et prévisions 5 jours", icon: <Cloud size={20} /> },
  { type: "pomodoro", label: "Pomodoro",     description: "Timer Pomodoro interactif avec pauses",  icon: <Timer size={20} /> },
  { type: "stocks",   label: "Bourse",       description: "Cours d'actions avec simulation live",   icon: <TrendingUp size={20} /> },
];

interface WidgetFactoryProps {
  onClose: () => void;
}

export function WidgetFactory({ onClose }: WidgetFactoryProps) {
  const { addWidget, widgets } = useWidgetStore();
  const [selectedType, setSelectedType] = useState<WidgetType | null>(null);
  const [title, setTitle]       = useState("");
  const [position, setPosition] = useState(widgets.length.toString());

  const handleAdd = () => {
    if (!selectedType) return;
    const t = title.trim() || WIDGET_TYPES.find((w) => w.type === selectedType)?.label || selectedType;
    addWidget(selectedType, t, parseInt(position, 10));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-primary">Ajouter un widget</h2>
            <p className="text-xs text-muted mt-0.5">Choisissez le type et la position</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-2 text-muted hover:text-primary transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-2 max-h-72 overflow-auto">
            {WIDGET_TYPES.map((wt) => (
              <button key={wt.type}
                onClick={() => { setSelectedType(wt.type); setTitle(wt.label); }}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all text-left
                  ${selectedType === wt.type
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent/30 hover:bg-surface-2"}`}
              >
                <span className={selectedType === wt.type ? "text-accent" : "text-muted"}>{wt.icon}</span>
                <div>
                  <p className="text-sm font-medium text-primary">{wt.label}</p>
                  <p className="text-xs text-muted mt-0.5 leading-relaxed">{wt.description}</p>
                </div>
              </button>
            ))}
          </div>

          {selectedType && (
            <div className="flex flex-col gap-3 pt-3 border-t border-border">
              <Input label="Titre du widget" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mon widget..." />
              <Select label="Position dans la grille" value={position} onChange={(e) => setPosition(e.target.value)}
                options={Array.from({ length: widgets.length + 1 }, (_, i) => ({
                  value: i.toString(),
                  label: i === widgets.length ? `Fin (position ${i})` : `Position ${i}`,
                }))}
              />
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={onClose}>Annuler</Button>
            <Button onClick={handleAdd} disabled={!selectedType}>Ajouter le widget</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
