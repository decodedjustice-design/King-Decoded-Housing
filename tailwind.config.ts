import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cream: "#f7efe4",
        parchment: "#fbf7f0",
        espresso: "#3a241c",
        cocoa: "#5d4136",
        burgundy: "#7d3348",
        clay: "#a56d57",
        sage: "#697b63",
        ink: "#211915"
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        calm: "0 18px 55px rgba(58, 36, 28, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
