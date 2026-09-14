import path from "path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig({
  // Keycloak doit retrouver une origine stable dans les redirect URIs du client.
  server: {
    host: '0.0.0.0', //pour ecouter sur tous les réseaux.
    port: 5173,
    strictPort: true,
  },

  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
