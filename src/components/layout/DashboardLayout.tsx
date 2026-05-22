import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  closestCenter,
} from "@dnd-kit/core";
import { LayoutTemplate } from "lucide-react";
import type { WidgetConfig } from "../../types";
import { useWidgetStore } from "../../hooks/useWidgetStore";
import { useAuth } from "../../context/AuthContext";
import { WidgetRenderer } from "../widgets/WidgetRenderer";
import { AdminWidgetPanel } from "../admin/AdminWidgetPanel";

const CENTER_SLOT_ID = "__center_slot__";

function CenterSlot({
  expandedWidget,
  isDragOver,
  onAdminEdit,
}: {
  expandedWidget: WidgetConfig | null;
  isDragOver: boolean;
  onAdminEdit: (id: string) => void;
}) {
  const { setNodeRef } = useDroppable({ id: CENTER_SLOT_ID });

  if (expandedWidget) {
    return (
      <div
        ref={setNodeRef}
        className="relative h-full w-full rounded-[2rem] bg-surface border-2 shadow-glow overflow-hidden"
      >
        <WidgetRenderer
          config={expandedWidget}
          mode="expanded"
          onAdminEdit={() => onAdminEdit(expandedWidget.id)}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={`relative h-full w-full rounded-[2rem] border-2 p-6 flex flex-col items-center justify-center gap-3 transition-all duration-200
        ${isDragOver ? "border-accent bg-accent/10" : "border-border/70 bg-surface/80"}`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
        ${isDragOver ? "bg-accent/15" : "bg-surface-2"}`}>
        <LayoutTemplate size={26} className={isDragOver ? "text-accent" : "text-muted/40"} />
      </div>
      <div className="text-center max-w-[16rem]">
        <p className={`text-sm font-semibold ${isDragOver ? "text-accent" : "text-primary"}`}>
          {isDragOver ? "Déposer ici pour agrandir" : "Zone centrale d'agrandissement"}
        </p>
        <p className="text-xs text-muted/60 mt-2">
          Glissez un widget depuis un côté pour le mettre en avant.
        </p>
      </div>
    </div>
  );
}

function SortableWidget({
  config,
  onAdminEdit,
  isDraggingThis,
}: {
  config: WidgetConfig;
  onAdminEdit: (id: string) => void;
  isDraggingThis: boolean;
}) {
  const { isAdminLayoutMode } = useWidgetStore((s) => ({ isAdminLayoutMode: s.isAdminLayoutMode }));
  const { isAdmin } = useAuth();

  const {
    attributes,
    listeners,
    setNodeRef,
  } = useDraggable({ id: config.id });

  const style = {
    
  };

  return (
    <div ref={setNodeRef} style={style} className="h-full">
      <WidgetRenderer
        config={config}
        mode="grid"
        onAdminEdit={() => onAdminEdit(config.id)}
        dragHandleProps={isAdmin && isAdminLayoutMode ? { ...attributes, ...listeners } : undefined}
        widgetDragProps={!isAdminLayoutMode ? { ...attributes, ...listeners } : undefined}
      />
    </div>
  );
}

export function DashboardLayout() {
  const {
    widgets,
    expandedWidgetId,
    setExpanded,
    isAdminLayoutMode,
  } = useWidgetStore();
  const { isAdmin } = useAuth();
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isDragOverCenter, setIsDragOverCenter] = useState(false);

  const sorted = [...widgets].sort((a, b) => a.position - b.position);
  const expandedWidget = expandedWidgetId ? widgets.find((w) => w.id === expandedWidgetId) ?? null : null;
  const peripheralWidgets = sorted;

  const topWidgets = peripheralWidgets.slice(0, 3);
  const leftWidgets = peripheralWidgets.slice(3, 5);
  const rightWidgets = peripheralWidgets.slice(5, 7);
  const bottomWidgets = peripheralWidgets.slice(7, 10);
  const extraWidgets = peripheralWidgets.slice(10);
  const editingWidget = editingWidgetId ? widgets.find((w) => w.id === editingWidgetId) ?? null : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setDraggingId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const activeWidget = widgets.find((w) => w.id === (event.active.id as string));
    const overCenter = event.over?.id === CENTER_SLOT_ID;

    if (overCenter && activeWidget && !activeWidget.focusable) {
      setIsDragOverCenter(false);
      return;
    }

    setIsDragOverCenter(overCenter);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggingId(null);
    setIsDragOverCenter(false);

    if (!over) return;

    if (over.id === CENTER_SLOT_ID) {
      const activeId = active.id as string;
      const activeWidget = widgets.find((w) => w.id === activeId);
      if (activeWidget && !activeWidget.focusable) return;
      setExpanded(activeId);
      return;
    }

    return;
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div
          className="grid h-full min-h-0 gap-4 mt-8"
          style={{
            gridTemplateColumns: "minmax(240px, 1fr) minmax(560px, 58%) minmax(240px, 1fr)",
            gridTemplateRows: "minmax(220px, 1fr) 560px minmax(220px, 1fr)",
          }}
        >
          {topWidgets.map((w) => (
            <SortableWidget
              key={w.id}
              config={w}
              onAdminEdit={setEditingWidgetId}
              isDraggingThis={draggingId === w.id}
            />
          ))}
          {Array.from({ length: Math.max(0, 3 - topWidgets.length) }).map((_, index) => (
            <div key={`top-empty-${index}`} className="rounded-3xl bg-surface-2" />
          ))}

          <div className="flex h-full flex-col justify-between">
            {leftWidgets.map((w) => (
              <div key={w.id} className="h-[240px] rounded-3xl bg-surface-2">
                <SortableWidget
                  config={w}
                  onAdminEdit={setEditingWidgetId}
                  isDraggingThis={draggingId === w.id}
                />
              </div>
            ))}
            {Array.from({ length: Math.max(0, 2 - leftWidgets.length) }).map((_, index) => (
              <div key={`left-empty-${index}`} className="h-[240px] rounded-3xl bg-surface-2" />
            ))}
          </div>

          <CenterSlot
            expandedWidget={expandedWidget}
            isDragOver={isDragOverCenter}
            onAdminEdit={setEditingWidgetId}
          />

          <div className="flex h-full flex-col justify-between">
            {rightWidgets.map((w) => (
              <div key={w.id} className="h-[240px] rounded-3xl bg-surface-2">
                <SortableWidget
                  config={w}
                  onAdminEdit={setEditingWidgetId}
                  isDraggingThis={draggingId === w.id}
                />
              </div>
            ))}
            {Array.from({ length: Math.max(0, 2 - rightWidgets.length) }).map((_, index) => (
              <div key={`right-empty-${index}`} className="h-[240px] rounded-3xl bg-surface-2" />
            ))}
          </div>

          {bottomWidgets.map((w) => (
            <SortableWidget
              key={w.id}
              config={w}
              onAdminEdit={setEditingWidgetId}
              isDraggingThis={draggingId === w.id}
            />
          ))}
          {Array.from({ length: Math.max(0, 3 - bottomWidgets.length) }).map((_, index) => (
            <div key={`bottom-empty-${index}`} className="rounded-3xl bg-surface-2" />
          ))}
        </div>

        {extraWidgets.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {extraWidgets.map((w) => (
              <SortableWidget
                key={w.id}
                config={w}
                onAdminEdit={setEditingWidgetId}
                isDraggingThis={draggingId === w.id}
              />
            ))}
          </div>
        )}
      </DndContext>

      {editingWidget && isAdmin && (
        <AdminWidgetPanel widget={editingWidget} onClose={() => setEditingWidgetId(null)} />
      )}
    </>
  );
}
