import React, { useState } from "react";
import { Settings2, Trash2, Eye, EyeOff, RotateCcw, Plus } from "lucide-react";
import { useWidgetStore } from "../../hooks/useWidgetStore";
import { Button, Badge, Toggle, Card } from "../ui";
import { AdminWidgetPanel } from "./AdminWidgetPanel";
import { WidgetFactory } from "./WidgetFactory";
import type { WidgetConfig } from "../../types";

const TYPE_LABELS: Record<string, string> = {
  poll: "Sondage",
  crypto: "Crypto",
  stats: "Stats",
  rss: "RSS",
  clock: "Horloge",
  note: "Note",
  calendar: "Agenda",
};

export function AdminView() {
  const { widgets, removeWidget, updateWidget, resetWidgets } = useWidgetStore();
  const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null);
  const [showFactory, setShowFactory] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const sorted = [...widgets].sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Administration</h1>
          <p className="text-sm text-muted mt-1">
            Gérez le contenu et la configuration des widgets
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Plus size={13} />}
            onClick={() => setShowFactory(true)}
          >
            Nouveau widget
          </Button>
          {confirmReset ? (
            <div className="flex gap-1">
              <Button variant="danger" size="sm" onClick={() => { resetWidgets(); setConfirmReset(false); }}>
                Confirmer
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmReset(false)}>
                Annuler
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              icon={<RotateCcw size={13} />}
              onClick={() => setConfirmReset(true)}
            >
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Widgets total", value: widgets.length },
          { label: "Focusables", value: widgets.filter((w) => w.focusable).length },
          { label: "Types différents", value: new Set(widgets.map((w) => w.type)).size },
        ].map((s) => (
          <div key={s.label} className="bg-surface-2 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{s.value}</p>
            <p className="text-xs text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Widget list */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">
          Widgets ({sorted.length})
        </p>
        {sorted.map((widget) => (
          <div
            key={widget.id}
            className="flex items-center gap-4 p-4 bg-surface border border-border rounded-xl
              hover:border-accent/20 transition-all group"
          >
            {/* Position badge */}
            <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-muted">{widget.position}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-primary truncate">{widget.title}</p>
                <Badge variant={widget.focusable ? "accent" : "default"}>
                  {TYPE_LABELS[widget.type] ?? widget.type}
                </Badge>
                {widget.focusable && (
                  <Badge variant="info" className="text-[10px]">Focusable</Badge>
                )}
              </div>
              <p className="text-xs text-muted">
                ID: <code className="font-mono text-muted/80">{widget.id}</code>
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <Toggle
                checked={widget.focusable}
                onChange={(v) => updateWidget(widget.id, { focusable: v })}
              />
              <button
                onClick={() => setEditingWidget(widget)}
                className="p-2 rounded-lg text-muted hover:text-primary hover:bg-surface-2 transition-colors"
                aria-label="Configurer"
              >
                <Settings2 size={15} />
              </button>
              <button
                onClick={() => removeWidget(widget.id)}
                className="p-2 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                aria-label="Supprimer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Admin panels */}
      {editingWidget && (
        <AdminWidgetPanel widget={editingWidget} onClose={() => setEditingWidget(null)} />
      )}
      {showFactory && <WidgetFactory onClose={() => setShowFactory(false)} />}
    </div>
  );
}
