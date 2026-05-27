import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev we serve at `/`. In production build we serve at `/service-finder/` so
// GitHub Pages (https://htownley.github.io/service-finder/) routes correctly.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/service-finder/' : '/',
  plugins: [react()],
  server: { port: 3000, open: false }
}))
