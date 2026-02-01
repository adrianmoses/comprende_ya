// vite.config.ts
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
      port: 3000,
  },
  plugins: [
      tailwindcss(),
      tsConfigPaths({
          projects: ['./tsconfig.json']
      }),
      tanstackStart(),
      nitro(),
      // react's vite plugin must come after start's vite plugin
      viteReact(),
  ],
  nitro: {}
})
