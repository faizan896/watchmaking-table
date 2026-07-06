/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0a09",
        bone: "#e8e2d6",
        champagne: "#c8a24b",
        smoke: "#8d867a",
      },
      fontFamily: {
        display: ["Didot", "Bodoni MT", "Playfair Display", "Georgia", "serif"],
        body: ["Georgia", "Times New Roman", "serif"],
      },
      letterSpacing: {
        luxe: "0.42em",
        wide2: "0.24em",
      },
    },
  },
  plugins: [],
};
