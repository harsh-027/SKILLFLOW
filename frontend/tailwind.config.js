/** @type {import('tailwindcss').Config} */
export default {
  darkMode: false,
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        primary: [
          "Space Grotesk",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        brand: ["Ethnocentric", "Space Grotesk", "system-ui", "sans-serif"],
        mono: ["DM Mono", "SFMono-Regular", "Consolas", "Liberation Mono", "monospace"],
        sans: [
          "Space Grotesk",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        display: ["Ethnocentric", "Space Grotesk", "system-ui", "sans-serif"],
      },
    },
  },
};
