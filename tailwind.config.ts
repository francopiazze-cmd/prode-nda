import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nda: {
          // Paleta oficial NDA (brandbook 15/08/2023)
          primary: "#182aa4", // azul corporativo
          accent: "#4aeaea",  // cyan (las curvas del logo)
          success: "#00ffa1", // verde menta (acento secundario)
          dark: "#0a1452",    // azul más oscuro que primary, para fondos y texto
          soft: "#F5F7FB"     // off-white para fondos suaves
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
