import React, { ReactNode } from "react";
import { X, GripVertical, Trash2, Settings, Minimize2 } from "lucide-react";
import type { WidgetConfig, DisplayMode } from "../../types";
import { useWidgetStore } from "../../hooks/useWidgetStore";
import { useAuth } from "../../context/AuthContext";

interface WidgetWrapperProps {
  config: WidgetConfig;
  mode: DisplayMode;
  children: ReactNode;
  onAdminEdit?: () => void;
  dragHandleProps?: Record<string, unknown>;
  widgetDragProps?: Record<string, unknown>;
}
export const WIDGET_CARD_HEIGHT = "h-[240px]";

export function WidgetWrapper({
  config,
  mode,
  children,
  onAdminEdit,
  dragHandleProps,
  widgetDragProps,
}: WidgetWrapperProps) {
  const { setExpanded, removeWidget, isAdminLayoutMode } = useWidgetStore((s) => ({
    setExpanded: s.setExpanded,
    removeWidget: s.removeWidget,
    isAdminLayoutMode: s.isAdminLayoutMode,
  }));

  const { isAdmin } = useAuth();

  if (mode === "expanded") {
    return (
      <div className="flex flex-col h-full bg-surface rounded-xl border border-accent/30 overflow-hidden shadow-glow">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h2 className="text-sm font-semibold text-primary">{config.title}</h2>
          <div className="flex items-center gap-1">
            {isAdmin && onAdminEdit && (
              <button
                onClick={onAdminEdit}
                className="p-1.5 rounded-md hover:bg-surface-2 text-muted hover:text-primary transition-colors"
                aria-label="Configurer"
              >
                <Settings size={14} />
              </button>
            )}
            <button
              onClick={() => setExpanded(null)}
              className="p-1.5 rounded-md hover:bg-surface-2 text-muted hover:text-primary transition-colors"
              aria-label="Réduire"
            >
              <Minimize2 size={14} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">{children}</div>
      </div>
    );
  }

  
  return (
    <div
      className={`relative group bg-surface border border-border rounded-xl overflow-hidden
        flex flex-col ${WIDGET_CARD_HEIGHT} transition-all duration-200
        ${isAdminLayoutMode ? "ring-1 ring-accent/30 ring-dashed" : "hover:border-border/60"}`}
    >
      
      <div
        className={`flex items-center justify-between px-3 py-2 border-b border-border/60 shrink-0
          ${!isAdminLayoutMode ? "cursor-grab active:cursor-grabbing" : ""}`}
        {...(!isAdminLayoutMode ? widgetDragProps : {})}
      >
        <div className="flex items-center gap-2">
          {isAdmin && isAdminLayoutMode && (
            <span
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing text-muted/40 hover:text-muted transition-colors"
            >
              <GripVertical size={14} />
            </span>
          )}
          <span className="text-xs font-medium text-muted truncate select-none">
            {config.title}
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isAdmin && isAdminLayoutMode && (
            <>
              {onAdminEdit && (
                <button
                  onClick={onAdminEdit}
                  className="p-1 rounded text-muted/60 hover:text-primary hover:bg-surface-2 transition-colors"
                  aria-label="Configurer"
                >
                  <Settings size={12} />
                </button>
              )}
              <button
                onClick={() => removeWidget(config.id)}
                className="p-1 rounded text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                aria-label="Supprimer"
              >
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      </div>

      
      <div className="flex-1 p-[var(--widget-padding)] overflow-auto">{children}</div>
    </div>
  );
}
