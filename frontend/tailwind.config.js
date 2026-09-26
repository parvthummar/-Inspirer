/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    // Only the design tokens are available as colors.
    colors: {
      transparent: "transparent",
      current: "currentColor",
      surface: "rgb(var(--surface-rgb) / <alpha-value>)",
      panel: "rgb(var(--panel-rgb) / <alpha-value>)",
      ink: "rgb(var(--ink-rgb) / <alpha-value>)",
      muted: "rgb(var(--muted-rgb) / <alpha-value>)",
      line: "rgb(var(--line-rgb) / <alpha-value>)",
      accent: "rgb(var(--accent-rgb) / <alpha-value>)",
      danger: "rgb(var(--danger-rgb) / <alpha-value>)",
      success: "rgb(var(--success-rgb) / <alpha-value>)",
      "on-accent": "rgb(var(--on-accent-rgb) / <alpha-value>)",
      terminal: "rgb(var(--terminal-rgb) / <alpha-value>)",
      "terminal-ink": "rgb(var(--terminal-ink-rgb) / <alpha-value>)",
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "toast-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "drawer-in": {
          from: { transform: "translateX(24px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
      },
      animation: {
        "toast-in": "toast-in 180ms ease-out",
        "drawer-in": "drawer-in 200ms ease-out",
      },
    },
  },
  plugins: [],
};
