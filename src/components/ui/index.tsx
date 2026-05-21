import React, { InputHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  loading,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-40 disabled:cursor-not-allowed";

  const variants: Record<ButtonVariant, string> = {
    primary: "bg-accent text-white hover:bg-accent/90 active:scale-95",
    ghost: "text-muted hover:text-primary hover:bg-surface-2 active:scale-95",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-95",
    outline: "border border-border text-primary hover:bg-surface-2 active:scale-95",
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "text-xs px-2.5 py-1.5",
    md: "text-sm px-3.5 py-2",
    lg: "text-base px-5 py-2.5",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoadingSpinner size={size} /> : icon}
      {children}
    </button>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({ label, error, icon, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">{icon}</span>
        )}
        <input
          className={`w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-primary
            placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent
            transition-all ${icon ? "pl-9" : ""} ${error ? "border-red-500/50" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className = "", ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-muted uppercase tracking-wider">{label}</label>
      )}
      <textarea
        className={`w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-primary
          placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent
          resize-none transition-all ${className}`}
        {...props}
      />
    </div>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = "", hover, onClick }: CardProps) {
  return (
    <div
      className={`bg-surface border border-border rounded-xl p-[var(--widget-padding)]
        ${hover ? "cursor-pointer hover:border-accent/40 hover:bg-surface-2 transition-all duration-200" : ""}
        ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "accent";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-surface-2 text-muted border-border",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-red-500/10 text-red-400 border-red-500/20",
    info: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    accent: "bg-accent/10 text-accent border-accent/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

function LoadingSpinner({ size }: { size: ButtonSize }) {
  const s = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  return (
    <svg className={`animate-spin ${s}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className = "", ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-muted uppercase tracking-wider">{label}</label>
      )}
      <select
        className={`w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-primary
          focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all ${className}`}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
          checked ? "bg-accent" : "bg-surface-2 border border-border"
        }`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </div>
      {label && <span className="text-sm text-primary">{label}</span>}
    </label>
  );
}

export function Divider({ className = "" }: { className?: string }) {
  return <hr className={`border-border ${className}`} />;
}
