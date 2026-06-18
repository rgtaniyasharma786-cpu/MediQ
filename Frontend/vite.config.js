import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
  // server: {
  //   port: 5173,
  //   // Serve index.html for all routes so React Router handles navigation
  //   // This ensures /login, /register, /admin etc. all work on refresh
  //   historyApiFallback: true,
  //   proxy: {
  //     '/api': {
  //       target: process.env.VITE_API_URL || 'http://localhost:5000',
  //       changeOrigin: true,
  //     },
  //     '/socket.io': {
  //       target: process.env.VITE_SOCKET_URL || 'http://localhost:5000',
  //       changeOrigin: true,
  //       ws: true,
  //     },
  //   },
  // },
  preview: {
    port: 4173,
    // Also needed for production preview
    historyApiFallback: true,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
       manualChunks(id) {
  if (
    id.includes('react') ||
    id.includes('react-dom') ||
    id.includes('react-router-dom')
  ) {
    return 'vendor'
  }

  if (id.includes('recharts')) {
    return 'charts'
  }

  if (id.includes('socket.io-client')) {
    return 'socket'
  }
}
      },
    },
  },
  }
})
