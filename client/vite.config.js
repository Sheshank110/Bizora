import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget =
    process.env.SERVER_URL ||
    env.SERVER_URL ||
    env.VITE_BACKEND_URL ||
    `http://localhost:${process.env.PORT || env.PORT || 5001}`

  return {
    plugins: [react(), tailwindcss()],
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor';
              }
              if (id.includes('recharts')) {
                return 'charts';
              }
              if (id.includes('three')) {
                return 'three';
              }
              if (id.includes('framer-motion')) {
                return 'motion';
              }
              if (id.includes('lucide-react') || id.includes('@tabler')) {
                return 'icons';
              }
              return 'deps';
            }
          },
        },
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/socket.io': {
          target: backendTarget,
          ws: true,
          changeOrigin: true,
        },
      },
    },
  }
})

