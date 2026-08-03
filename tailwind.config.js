/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FBF9F5",
        charcoal: "#1A1A1A",
        terracotta: "#E05A47",
        blush: "#F4A291",
        lavender: "#D8D8F6",
        softGray: "#F0ECE1",
        inkMuted: "#4A4A4A"
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        hand: ["'Caveat'", "cursive"],
        sketch: ["'Kalam'", "cursive"]
      },
      boxShadow: {
        brutal: "4px 4px 0px #1A1A1A",
        "brutal-lg": "6px 6px 0px #1A1A1A",
        "brutal-hover": "8px 8px 0px #E05A47",
        "soft-glow": "0 0 25px rgba(224, 90, 71, 0.15)"
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
        flicker: "flicker 0.15s infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(2deg)" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" }
        },
        flicker: {
          "0%": { opacity: "0.9" },
          "50%": { opacity: "0.4" },
          "100%": { opacity: "1" }
        }
      }
    },
  },
  plugins: [],
}
