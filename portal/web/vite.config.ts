import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const PORTAL_SERVER = "http://127.0.0.1:3001";

// Prototipin kendi barındırdığı fontlar sunucu kökünden servis edilir.
const FONT_PATHS = /^\/(manrope|dm-sans|space-grotesk)-\d+\.ttf$/;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      // changeOrigin bilerek kapali birakildi. Portal sunucusu POST'larda
      // Origin basligini 'http://' + Host ile karsilastiriyor; ikisi de dev
      // sunucusunu gostermeli, aksi halde istek 403 Origin denied doner.
      "/api": { target: PORTAL_SERVER, changeOrigin: false },
      [FONT_PATHS.source]: { target: PORTAL_SERVER, changeOrigin: false },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
