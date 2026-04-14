import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1B2A4A",
          light: "#2A3F6E",
        },
        gold: {
          DEFAULT: "#C5A572",
          hover: "#B8955F",
          dark: "#8B7342",
        },
        surface: "#F8F7F4",
        callout: "#F0EDE6",
        border: "#E2E0DB",
        "border-light": "#F0EDE6",
        "text-secondary": "#4A5568",
        "text-muted": "#718096",
      },
      fontFamily: {
        heebo: ["Heebo", "sans-serif"],
      },
      fontSize: {
        h1: ["2.5rem", { lineHeight: "1.3" }],
        h2: ["2rem", { lineHeight: "1.3" }],
        h3: ["1.5rem", { lineHeight: "1.3" }],
        h4: ["1.25rem", { lineHeight: "1.3" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        body: ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.6" }],
        caption: ["0.75rem", { lineHeight: "1.6" }],
        nav: ["0.9375rem", { lineHeight: "1.3" }],
      },
      spacing: {
        "space-1": "0.25rem",
        "space-2": "0.5rem",
        "space-3": "0.75rem",
        "space-4": "1rem",
        "space-5": "1.5rem",
        "space-6": "2rem",
        "space-7": "2.5rem",
        "space-8": "3rem",
        "space-9": "4rem",
        "space-10": "5rem",
        "space-11": "6rem",
        "space-12": "8rem",
      },
      borderRadius: {
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        pill: "9999px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(27, 42, 74, 0.05)",
        md: "0 4px 6px rgba(27, 42, 74, 0.07), 0 2px 4px rgba(27, 42, 74, 0.04)",
        lg: "0 10px 15px rgba(27, 42, 74, 0.1), 0 4px 6px rgba(27, 42, 74, 0.05)",
        xl: "0 20px 25px rgba(27, 42, 74, 0.1), 0 10px 10px rgba(27, 42, 74, 0.04)",
      },
      maxWidth: {
        content: "1200px",
        narrow: "800px",
      },
      transitionDuration: {
        fast: "150ms",
        base: "250ms",
        slow: "350ms",
      },
      keyframes: {
        "slide-in": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "scroll-left": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "scroll-right": {
          from: { transform: "translateX(-50%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "slide-in": "slide-in 250ms ease-out",
        "scroll-left": "scroll-left 30s linear infinite",
        "scroll-right": "scroll-right 30s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
