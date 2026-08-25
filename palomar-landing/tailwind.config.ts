import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0b1326",
          dim: "#0b1326",
          bright: "#31394d",
          lowest: "#060e20",
          low: "#131b2e",
          container: "#171f33",
          high: "#222a3d",
          highest: "#2d3449",
          variant: "#2d3449",
        },
        aurora: {
          text: "#dae2fd",
          muted: "#c4c7c8",
          outline: "#8e9192",
          "outline-variant": "#444748",
          blue: "#adc9eb",
          "blue-container": "#304b68",
          purple: "#7E22CE",
          pink: "#DB2777",
          teal: "#00E5FF",
          cyan: "#38bdf8",
          success: "#34d399",
          error: "#ffb4ab",
          "error-container": "#93000a",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-elevated": "0 12px 40px 0 rgba(0, 0, 0, 0.5)",
        "glow-cyan": "0 0 25px -5px rgba(56, 189, 248, 0.4)",
        "glow-purple": "0 0 25px -5px rgba(168, 85, 247, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
