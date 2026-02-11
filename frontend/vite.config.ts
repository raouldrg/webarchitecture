import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // Fail if port 5173 is occupied
    host: true,
    open: false,
    cors: true,
  },
  logLevel: 'warn', // Reduce Vite verbosity
})
