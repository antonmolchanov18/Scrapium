import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist-react', //Зміна назви дерикторії для уникнення конфлікту з Electron
  },
  server: {
    port: 5123,
    strictPort: true,
  },
})
