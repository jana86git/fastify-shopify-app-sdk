import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const proxyOptions = {
  target: `https://localhost:3000`,
  changeOrigin: false,
  secure: true,
  ws: true,
};
// https://vite.dev/config/
export default defineConfig({
  base: '/app-two/',
  plugins: [react()],
  server: {
    hmr: {
      clientPort: 3000,
      protocol: 'wss',
      host: 'localhost'
    },
    proxy: {
      "^/server(/|(\\?.*)?$)": proxyOptions,
    },
  }
})
