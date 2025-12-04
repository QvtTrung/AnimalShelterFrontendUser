import { nextui } from "@nextui-org/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e6f9f0",
          100: "#ccf3e1",
          200: "#99e7c3",
          300: "#66dba5",
          400: "#33cf87",
          500: "#00c369",
          600: "#00a256",
          700: "#008243",
          800: "#006130",
          900: "#00411d",
          DEFAULT: "#00c369",
          foreground: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["Be Vietnam Pro", "system-ui", "sans-serif"],
        heading: ["Nunito Sans", "system-ui", "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            primary: {
              50: "#e6f9f0",
              100: "#ccf3e1",
              200: "#99e7c3",
              300: "#66dba5",
              400: "#33cf87",
              500: "#00c369",
              600: "#00a256",
              700: "#008243",
              800: "#006130",
              900: "#00411d",
              DEFAULT: "#00c369",
              foreground: "#ffffff",
            },
            focus: "#00c369",
          },
        },
        dark: {
          colors: {
            primary: {
              50: "#e6f9f0",
              100: "#ccf3e1",
              200: "#99e7c3",
              300: "#66dba5",
              400: "#33cf87",
              500: "#00c369",
              600: "#00a256",
              700: "#008243",
              800: "#006130",
              900: "#00411d",
              DEFAULT: "#00c369",
              foreground: "#ffffff",
            },
            focus: "#00c369",
          },
        },
      },
    }),
  ],
};
