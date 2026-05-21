import React, { useState } from "react";
import { Orbit, LayoutGrid, Settings, Move, Plus, RefreshCcw, ChevronDown } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useWidgetStore } from "../../hooks/useWidgetStore";
import { Button, Badge } from "../ui";
import { WidgetFactory } from "../admin/WidgetFactory";
import type { ThemeDensity } from "../../types";

interface NavbarProps {
  view: "dashboard" | "admin";
  onViewChange: (v: "dashboard" | "admin") => void;
}

export function Navbar({ view, onViewChange }: NavbarProps) {
  const { theme, setDensity } = useTheme();
  const { user, isAdmin, login, logout } = useAuth();
  const { isAdminLayoutMode, toggleAdminLayoutMode, resetWidgets } = useWidgetStore();
  const [showFactory, setShowFactory] = useState(false);
  const [showDensity, setShowDensity] = useState(false);

  const densities: { value: ThemeDensity; label: string }[] = [
    { value: "compact", label: "Compact" },
    { value: "normal", label: "Normal" },
    { value: "spaced", label: "Spacieux" },
  ];

  return (
    <>
      <nav className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <Orbit size={16} className="text-white" />
            </div>
            <span className="text-base font-bold text-primary tracking-tight">OrbitDash</span>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-1 ml-3 p-1 bg-surface-2 rounded-lg">
              <button
                onClick={() => onViewChange("dashboard")}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-all ${
                  view === "dashboard"
                    ? "bg-surface text-primary shadow-sm"
                    : "text-muted hover:text-primary"
                }`}
              >
                <LayoutGrid size={13} />
                Dashboard
              </button>
              <button
                onClick={() => onViewChange("admin")}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-all ${
                  view === "admin"
                    ? "bg-surface text-primary shadow-sm"
                    : "text-muted hover:text-primary"
                }`}
              >
                <Settings size={13} />
                Admin
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Density picker */}
          <div className="relative">
            <button
              onClick={() => setShowDensity(!showDensity)}
              className="flex items-center gap-1 text-xs text-muted hover:text-primary px-2 py-1.5 rounded-md hover:bg-surface-2 transition-colors"
            >
              Densité
              <ChevronDown size={12} />
            </button>
            {showDensity && (
              <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg z-50 py-1 w-32">
                {densities.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => { setDensity(d.value); setShowDensity(false); }}
                    className={`w-full text-left text-xs px-3 py-2 transition-colors hover:bg-surface-2
                      ${theme.density === d.value ? "text-accent font-medium" : "text-primary"}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Admin layout toggle */}
          {isAdmin && view === "dashboard" && (
            <button
              onClick={toggleAdminLayoutMode}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all ${
                isAdminLayoutMode
                  ? "bg-accent text-white"
                  : "text-muted hover:text-primary hover:bg-surface-2"
              }`}
            >
              <Move size={13} />
              {isAdminLayoutMode ? "Terminer" : "Réorganiser"}
            </button>
          )}

          {/* Add widget */}
          {isAdmin && view === "dashboard" && (
            <Button
              size="sm"
              icon={<Plus size={13} />}
              onClick={() => setShowFactory(true)}
            >
              Widget
            </Button>
          )}

          {/* User menu */}
          <div className="flex items-center gap-2 ml-1 pl-2 border-l border-border">
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-accent">{user?.avatar ?? "?"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-primary leading-none">{user?.name}</span>
              <Badge variant={isAdmin ? "accent" : "default"} className="mt-0.5 text-[10px] py-0">
                {isAdmin ? "Admin" : "User"}
              </Badge>
            </div>
            <button
              onClick={() => login(isAdmin ? "user" : "admin")}
              className="text-xs text-muted hover:text-primary px-2 py-1 rounded hover:bg-surface-2 transition-colors ml-1"
              title="Changer de rôle (demo)"
            >
              <RefreshCcw size={12} />
            </button>
          </div>
        </div>
      </nav>

      {showFactory && <WidgetFactory onClose={() => setShowFactory(false)} />}
    </>
  );
}
