import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'rotinai_icon.png'],
      manifest: {
        name: 'RotinAI',
        short_name: 'RotinAI',
        description: 'Sua rotina inteligente com IA',
        theme_color: '#1a1f2c',
        icons: [
          {
            src: '/rotinai_icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/rotinai_icon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
