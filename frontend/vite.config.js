import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  
  plugins: [react(),tailwindcss()],
  build: {
    outDir: '../public',  // This will place the build output in the public folder of Firebase Hosting
  },
})

