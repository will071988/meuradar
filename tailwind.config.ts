import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        radar: {
          deep: "#0B2D5B",
          DEFAULT: "#1450A0",
          sky: "#EAF2F8",
          cyan: "#00C2D7",
          accent: "#FF8A3D",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(11, 45, 91, 0.08)",
        card: "0 2px 16px rgba(11, 45, 91, 0.06)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
