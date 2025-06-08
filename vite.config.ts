import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/eh': {
        target: 'https://e-hentai.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/eh/, '')
      },
      '/jm': {
        target: 'https://18comic.vip',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/eh/, '')
      }
    }
  }
})
