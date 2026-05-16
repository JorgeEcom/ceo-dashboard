import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    allowedHosts: 'all',
    host: true,
    proxy: {
      '/api/ghl': {
        target: 'https://services.leadconnectorhq.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ghl/, ''),
        headers: {
          'Version': '2021-07-28',
          'Accept': 'application/json',
        },
      },
    },
  },
})
