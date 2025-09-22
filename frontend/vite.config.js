import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    headers: {
      // Remove COOP header as we're using redirect flow now
      // 'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
    // Add proxy for development to avoid CORS issues
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
})
