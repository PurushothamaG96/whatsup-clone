import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "wa-bg": "#111b21",
        "wa-panel": "#202c33",
        "wa-chat": "#0b141a",
        "wa-input": "#2a3942",
        "wa-green": "#00a884",
        "wa-blue": "#53bdeb",
        "wa-msg-out": "#005c4b",
        "wa-msg-in": "#202c33",
        "wa-text": "#e9edef",
        "wa-secondary": "#8696a0",
        "wa-icon": "#aebac1",
        "wa-divider": "#222d34",
        "wa-hover": "#2a3942",
      },
    },
  },
  plugins: [],
};

export default config;
