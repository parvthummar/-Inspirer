/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    // Only the design tokens are available as colors.
    colors: {
      transparent: "transparent",
      current: "currentColor",
      surface: "var(--surface)",
      panel: "var(--panel)",
      ink: "var(--ink)",
      muted: "var(--muted)",
      line: "var(--line)",
      accent: "var(--accent)",
      danger: "var(--danger)",
      success: "var(--success)",
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};
