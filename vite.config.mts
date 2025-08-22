import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import tailwindcss from '@tailwindcss/vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import legacyPlugin from '@vitejs/plugin-legacy'
import { browserslistToTargets } from 'lightningcss'
import browserslist from 'browserslist'
import { VantResolver } from '@vant/auto-import-resolver'
import MotionResolver from 'motion-v/resolver'
import { vite as vidstack } from 'vidstack/plugins'
import { createHtmlPlugin } from 'vite-plugin-html'
import { VitePWA } from 'vite-plugin-pwa'

import _package from './package.json'
export default defineConfig({
  plugins: [
    createHtmlPlugin({
      minify: true,
      entry: './src/main.tsx',
      inject: {
        data: {
          title: 'Delta Comic'
        }
      }
    }),
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('media-'),
        },
      },
    }),
    vidstack({ include: /.+\.player\.vue/ }),
    vueJsx(),
    Components({
      dts: true,
      resolvers: [
        VantResolver(),
        MotionResolver(),
        NaiveUiResolver()
      ],
    }),
    tailwindcss(),
    VitePWA({
      includeAssets: [],
      manifest: {
        name: _package.name,
        start_url: './',
        short_name: _package.name,
        icons: [{
          src: 'favicon.webp',
          sizes: "512x512",
          type: "image/webp",
          purpose: "any",
        }],
        display: 'standalone',
        lang: 'zh-cn'
      },
      injectRegister: 'inline',
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\.(js|css)/ig, // js /css /ts静态资源缓存
            handler: 'CacheFirst',
            options: {
              cacheName: 'script-cache',
            },
          }, {
            urlPattern: /\.(html)/ig, // html缓存
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              networkTimeoutSeconds: 5000
            },
          }, {
            urlPattern: /\.(webp|jpg|jpeg|png|ico)/ig, // 静态资源缓存
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache'
            },
          }
        ],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        maximumFileSizeToCacheInBytes: 1024 * 1024 * 1024
      },
      injectManifest: {
        maximumFileSizeToCacheInBytes: 1024 * 1024 * 1024
      },
      devOptions: {
        enabled: false,
      },
    }),
    legacyPlugin({
      targets: ['defaults', 'ie >= 11', 'chrome 52'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: true,
      renderModernChunks: false,
    })
  ],
  experimental: {
    enableNativePlugin: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    }
  },
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: browserslistToTargets(browserslist('> 1%, last 2 versions, not ie <= 8')),
      visitor: {
      }
    }
  },
  base: "/",
  server: {
    strictPort: true,
    port: 5173,
    host: true,
  }
})