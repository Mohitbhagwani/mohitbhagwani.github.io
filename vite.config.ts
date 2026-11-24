import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  base: "/",
  preview: { host: "0.0.0.0", allowedHosts: ["web"] },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: ["web"],
    watch: { usePolling: true },
  },
});
