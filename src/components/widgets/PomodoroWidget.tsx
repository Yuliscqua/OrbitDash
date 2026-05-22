import React, { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, SkipForward, Coffee, Zap } from "lucide-react";
import type { WidgetConfig, DisplayMode, PomodoroData, PomodoroPhase } from "../../types";
import { WidgetWrapper } from "./WidgetWrapper";

interface PomodoroWidgetProps {
  config: WidgetConfig;
  mode: DisplayMode;
  onAdminEdit?: () => void;
  dragHandleProps?: Record<string, unknown>;
  widgetDragProps?: Record<string, unknown>;
}

// Couleurs par phase
const PHASE_COLORS: Record<PomodoroPhase, { accent: string; bg: string; label: string; icon: React.ReactNode }> = {
  work:       { accent: "#6366f1", bg: "bg-indigo-500/10",  label: "Travail",      icon: <Zap size={14} /> },
  shortBreak: { accent: "#10b981", bg: "bg-emerald-500/10", label: "Petite pause", icon: <Coffee size={14} /> },
  longBreak:  { accent: "#f59e0b", bg: "bg-amber-500/10",   label: "Grande pause", icon: <Coffee size={14} /> },
};

function pad(n: number) { return String(n).padStart(2, "0"); }

// Hook timer — indépendant du mode (grid ou expanded partagent le même état via closure locale au composant)
function usePomodoroTimer(data: PomodoroData) {
  const [phase, setPhase]       = useState<PomodoroPhase>("work");
  const [running, setRunning]   = useState(false);
  const [sessions, setSessions] = useState(0);    // sessions de travail complétées
  const [seconds, setSeconds]   = useState(data.workDuration * 60);

  const totalSeconds = useCallback(() => {
    if (phase === "work")       return data.workDuration * 60;
    if (phase === "shortBreak") return data.shortBreakDuration * 60;
    return data.longBreakDuration * 60;
  }, [phase, data]);

  // Tick
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          // Passage automatique à la phase suivante
          setRunning(false);
          if (phase === "work") {
            const next = sessions + 1;
            setSessions(next);
            const nextPhase: PomodoroPhase =
              next % data.sessionsUntilLongBreak === 0 ? "longBreak" : "shortBreak";
            setPhase(nextPhase);
            return (nextPhase === "longBreak" ? data.longBreakDuration : data.shortBreakDuration) * 60;
          } else {
            setPhase("work");
            return data.workDuration * 60;
          }
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, phase, sessions, data]);

  const reset  = () => { setRunning(false); setSeconds(totalSeconds()); };
  const skip   = () => {
    setRunning(false);
    const next: PomodoroPhase = phase === "work"
      ? (sessions + 1) % data.sessionsUntilLongBreak === 0 ? "longBreak" : "shortBreak"
      : "work";
    setPhase(next);
    setSeconds((next === "work" ? data.workDuration : next === "shortBreak" ? data.shortBreakDuration : data.longBreakDuration) * 60);
  };

  const progress = 1 - seconds / totalSeconds();
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return { phase, running, sessions, seconds, mins, secs, progress, totalSeconds: totalSeconds(), setRunning, reset, skip };
}

export function PomodoroWidget({ config, mode, onAdminEdit, dragHandleProps, widgetDragProps }: PomodoroWidgetProps) {
  const data = config.data as unknown as PomodoroData;
  const timer = usePomodoroTimer(data);

  return (
    <WidgetWrapper config={config} mode={mode} onAdminEdit={onAdminEdit}
      dragHandleProps={dragHandleProps} widgetDragProps={widgetDragProps}>
      {mode === "grid"     && <PomodoroGrid     data={data} timer={timer} />}
      {mode === "expanded" && <PomodoroExpanded data={data} timer={timer} />}
    </WidgetWrapper>
  );
}

// ── Vue grille : timer compact entièrement interactif ────────────────────────

function PomodoroGrid({ data, timer }: { data: PomodoroData; timer: ReturnType<typeof usePomodoroTimer> }) {
  const { phase, running, sessions, mins, secs, progress, setRunning, reset, skip } = timer;
  const col = PHASE_COLORS[phase];

  // Cercle SVG
  const R = 36, CIRC = 2 * Math.PI * R;

  return (
    <div className="flex flex-col items-center justify-between h-full gap-2">
      {/* Phase badge */}
      <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${col.bg}`}
        style={{ color: col.accent }}>
        {col.icon}
        <span className="font-medium">{col.label}</span>
      </div>

      {/* Cercle + temps */}
      <div className="relative flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <svg width="90" height="90" viewBox="0 0 90 90" className="-rotate-90">
          <circle cx="45" cy="45" r={R} fill="none" stroke="var(--color-border)" strokeWidth="5" />
          <circle cx="45" cy="45" r={R} fill="none"
            stroke={col.accent} strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - progress)}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-xl font-bold text-primary tabular-nums leading-none">
            {pad(mins)}:{pad(secs)}
          </span>
          <span className="text-xs text-muted mt-0.5">{sessions} 🍅</span>
        </div>
      </div>

      {/* Tâche */}
      {data.label && (
        <p className="text-xs text-muted truncate w-full text-center px-2">{data.label}</p>
      )}

      {/* Contrôles */}
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <button onClick={reset}
          className="p-1.5 rounded-lg hover:bg-surface-2 text-muted hover:text-primary transition-colors">
          <RotateCcw size={13} />
        </button>
        <button onClick={() => setRunning(!running)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all active:scale-95"
          style={{ background: col.accent }}>
          {running ? <Pause size={13} /> : <Play size={13} />}
          {running ? "Pause" : "Start"}
        </button>
        <button onClick={skip}
          className="p-1.5 rounded-lg hover:bg-surface-2 text-muted hover:text-primary transition-colors">
          <SkipForward size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Vue expanded : grand timer avec historique de session ─────────────────────

function PomodoroExpanded({ data, timer }: { data: PomodoroData; timer: ReturnType<typeof usePomodoroTimer> }) {
  const { phase, running, sessions, mins, secs, progress, totalSeconds, setRunning, reset, skip } = timer;
  const col = PHASE_COLORS[phase];
  const R = 80, CIRC = 2 * Math.PI * R;

  return (
    <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
      {/* Phase */}
      <div className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full ${col.bg}`}
        style={{ color: col.accent }}>
        {col.icon}
        <span className="font-semibold">{col.label}</span>
      </div>

      {/* Grand cercle */}
      <div className="relative flex items-center justify-center">
        <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
          <circle cx="100" cy="100" r={R} fill="none" stroke="var(--color-surface-2)" strokeWidth="8" />
          <circle cx="100" cy="100" r={R} fill="none"
            stroke={col.accent} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC * (1 - progress)}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-5xl font-bold text-primary tabular-nums">
            {pad(mins)}:{pad(secs)}
          </span>
          <span className="text-sm text-muted mt-1">
            sur {Math.floor(totalSeconds / 60)} min
          </span>
        </div>
      </div>

      {/* Tâche */}
      {data.label && (
        <p className="text-sm text-muted text-center">📌 {data.label}</p>
      )}

      {/* Contrôles */}
      <div className="flex items-center gap-3">
        <button onClick={reset}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm text-muted hover:text-primary hover:bg-surface-2 transition-colors">
          <RotateCcw size={15} /> Reset
        </button>
        <button onClick={() => setRunning(!running)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
          style={{ background: col.accent }}>
          {running ? <Pause size={16} /> : <Play size={16} />}
          {running ? "Pause" : "Démarrer"}
        </button>
        <button onClick={skip}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm text-muted hover:text-primary hover:bg-surface-2 transition-colors">
          <SkipForward size={15} /> Passer
        </button>
      </div>

      {/* Sessions */}
      <div className="flex flex-col items-center gap-2 w-full">
        <p className="text-xs text-muted uppercase tracking-wider">
          {sessions} session{sessions > 1 ? "s" : ""} complétée{sessions > 1 ? "s" : ""}
        </p>
        <div className="flex gap-1.5 flex-wrap justify-center">
          {Array.from({ length: Math.max(sessions, data.sessionsUntilLongBreak) }, (_, i) => (
            <span key={i} className={`text-lg transition-all ${i < sessions ? "opacity-100 scale-100" : "opacity-20 scale-90"}`}>
              🍅
            </span>
          ))}
        </div>
        <p className="text-xs text-muted/60 mt-1">
          Grande pause dans {data.sessionsUntilLongBreak - (sessions % data.sessionsUntilLongBreak)} session(s)
        </p>
      </div>

      {/* Config rapide */}
      <div className="grid grid-cols-3 gap-2 w-full text-center text-xs text-muted">
        <div className="bg-surface-2 rounded-lg p-2">
          <p className="font-medium text-primary">{data.workDuration}min</p>
          <p>Travail</p>
        </div>
        <div className="bg-surface-2 rounded-lg p-2">
          <p className="font-medium text-primary">{data.shortBreakDuration}min</p>
          <p>Petite pause</p>
        </div>
        <div className="bg-surface-2 rounded-lg p-2">
          <p className="font-medium text-primary">{data.longBreakDuration}min</p>
          <p>Grande pause</p>
        </div>
      </div>
    </div>
  );
}
