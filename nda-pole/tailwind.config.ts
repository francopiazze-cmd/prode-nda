import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta pastel tomada de las fotos: fondo caramelo cálido,
        // verde menta/sage de la ropa, crema y arcilla suave.
        cream: "#FBF6EF",
        sand: "#EFE3D3",
        clay: "#C99B6E",
        clayDark: "#A9784E",
        sage: {
          50: "#F2F6EF",
          100: "#E2ECDC",
          200: "#CFE0C6",
          300: "#B4CDA8",
          400: "#94B585",
          500: "#789A68",
          600: "#5F7E52",
        },
        ink: "#4A413A",
        inkSoft: "#6B6058",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.75rem",
      },
      boxShadow: {
        soft: "0 12px 40px -16px rgba(74, 65, 58, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
