import type { Config } from "tailwindcss";

// Palette sampled from the official Synergia logo.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14283D",
        deep: "#0E1E2E",
        teal: "#1898A0",
        tealDeep: "#184450",
        orange: "#DC842C",
        paper: "#F3F6F8",
        line: "#D3DEE5",
        slate: "#52677A",
        warn: "#B3261E",
      },
      fontFamily: { sans: ['"Readex Pro Variable"', "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
