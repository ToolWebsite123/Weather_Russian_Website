import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        sky: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#b9ddfe",
          300: "#7cc2fd",
          400: "#36a3f9",
          500: "#0c87ea",
          600: "#006bc8",
          700: "#0155a2",
          800: "#064986",
          900: "#0b3d6f",
          950: "#07274a",
        },
        sun: {
          50: "#fff8eb",
          100: "#ffefc6",
          200: "#ffdb88",
          300: "#ffc14a",
          400: "#ffa520",
          500: "#f98507",
          600: "#dd6102",
          700: "#b74106",
          800: "#94320c",
          900: "#7a2a0d",
          950: "#461402",
        },
        cloud: {
          50: "#f7f8f9",
          100: "#eef0f2",
          200: "#d9dde3",
          300: "#b8c0cb",
          400: "#919eae",
          500: "#748294",
          600: "#5e6b7c",
          700: "#4d5765",
          800: "#424a55",
          900: "#3a404a",
          950: "#242830",
        },
        storm: {
          50: "#f4f6f8",
          100: "#e4e9ed",
          200: "#ccd5dd",
          300: "#a8b7c5",
          400: "#7e93a7",
          500: "#63778d",
          600: "#4e6075",
          700: "#404e60",
          800: "#384351",
          900: "#323a46",
          950: "#21262f",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "sans-serif"],
        serif: ["var(--font-source-serif)", "serif"],
      },
      /**
       * Explicit Typography Scale System
       * ----------------------------------
       * Font Family Rules:
       * - Serif (`font-serif` / Source Serif 4): Reserved for page titles (`h1`) and major section titles (`h2`) for editorial warmth.
       * - Sans (`font-sans` / Outfit): Applied to everything else: `display` numbers, `h3` card titles, `body` text, `body-sm` metadata/labels, and `caption` micro-text.
       *
       * Named Scale Hierarchy:
       * - display: 4rem (64px) / line-height 1 / letter-spacing -0.02em / bold (700)
       * - h1: 2.25rem (36px) / line-height 1.2 / letter-spacing -0.015em / bold (700)
       * - h2: 1.375rem (22px) / line-height 1.35 / letter-spacing -0.01em / semi-bold (600)
       * - h3: 1.125rem (18px) / line-height 1.4 / semi-bold (600)
       * - body: 0.9375rem (15px) / line-height 1.5 / regular (400)
       * - body-sm: 0.8125rem (13px) / line-height 1.4 / regular (400)
       * - caption: 0.6875rem (11px) / line-height 1.3 / regular (400)
       */
      fontSize: {
        display: ["4rem", { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "700" }],
        h1: ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.015em", fontWeight: "700" }],
        h2: ["1.375rem", { lineHeight: "1.35", letterSpacing: "-0.01em", fontWeight: "600" }],
        h3: ["1.125rem", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["0.9375rem", { lineHeight: "1.5", fontWeight: "400" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.4", fontWeight: "400" }],
        caption: ["0.6875rem", { lineHeight: "1.3", fontWeight: "400" }],
      },
    },
  },
  plugins: [],
};
export default config;
