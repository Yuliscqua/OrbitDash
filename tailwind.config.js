/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "var(--color-base)",
        surface: {
          DEFAULT: "var(--color-surface)",
          2: "var(--color-surface-2)",
        },
        border: "var(--color-border)",
        primary: "var(--color-text-primary)",
        muted: "var(--color-text-muted)",
        accent: "var(--accent)",
      },
      boxShadow: {
        glow: "var(--shadow-glow)",
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["Syne", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      borderColor: {
        DEFAULT: "var(--color-border)",
      },
    },
  },
  plugins: [],
};
