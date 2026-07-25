/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Base surfaces (premium dark theme first-class citizen)
        background: {
          DEFAULT: "#0B0B14",
          elevated: "#13131F",
          card: "#181826",
          input: "#1D1D2C",
        },
        border: {
          DEFAULT: "#242437",
          subtle: "#1C1C2A",
        },
        // Brand / accent — violet-to-blue gradient family
        brand: {
          50: "#F1EEFF",
          100: "#E1DBFF",
          200: "#C3B7FF",
          300: "#A08CFF",
          400: "#8A6DFF",
          500: "#7C5CFC",
          600: "#6A46F0",
          700: "#5936C9",
          800: "#452A9C",
          900: "#332072",
        },
        accent: {
          teal: "#2DD4BF",
          pink: "#F472B6",
          amber: "#FBBF24",
          red: "#F87171",
          green: "#34D399",
        },
        text: {
          primary: "#F5F5FA",
          secondary: "#A6A6BF",
          tertiary: "#6B6B85",
          inverse: "#0B0B14",
        },
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        medium: ["Inter_500Medium"],
        semibold: ["Inter_600SemiBold"],
        bold: ["Inter_700Bold"],
      },
      borderRadius: {
        xl2: "20px",
        xl3: "28px",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
    },
  },
  plugins: [],
};
