import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0B1522",
        panel: "#131F30",
        raise: "#1A2A3F",
        line: "#2A3B52",
        mist: "#9DB0C6",
        brand: "#4CC38A",
        brandInk: "#062A1A",
        warn: "#FF9B8F",
      },
      fontFamily: { sans: ["var(--font-cairo)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
