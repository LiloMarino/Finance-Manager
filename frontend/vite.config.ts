import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, ".") },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "../backend/static"),
    emptyOutDir: true,
  },
  server: {
    // O proxy segue a porta do backend, que o FM_SERVER__PORT também define
    proxy: { "/api": `http://localhost:${process.env.FM_SERVER__PORT ?? "8000"}` },
  },
});
