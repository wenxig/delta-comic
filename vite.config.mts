import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import MotionResolver from 'motion-v/resolver'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import tailwindcss from '@tailwindcss/vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import legacyPlugin from '@vitejs/plugin-legacy'
import { browserslistToTargets } from 'lightningcss'
import browserslist from 'browserslist'
import { createHtmlPlugin } from 'vite-plugin-html'
import ConditionalCompile from "vite-plugin-conditional-compiler"
// import _package from './package.json'

export default defineConfig({
  plugins: [
    ConditionalCompile(),
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
    // legacyPlugin({
    //   targets: ['defaults', 'ie >= 11', 'chrome 52'],
    //   additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    //   renderLegacyChunks: true,
    //   renderModernChunks: false,
    // })
  ],
  experimental: {
    enableNativePlugin: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: ['.ts', '.tsx', '.json', '.mjs', '.js', '.jsx', '.mts']
  },
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: browserslistToTargets(browserslist('> 1%, last 2 versions, not ie <= 8'))
    }
  },
  build: {
    sourcemap: true
  },
  base: "/",
  server: {
    strictPort: true,
    port: 5173,
    host: true,
    proxy: {
      '/api0': {
        target: 'https://example.com',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api0\//g, '').replace(/^\//g, ''),
        configure(proxy, options) {
          console.log('config!!!')
          proxy.on("proxyReq", (proxyReq) => {
            // 在这里通过正则匹配获取目标服务器地址
            const url = decodeURI(proxyReq.path.replace(/^\/api0\//g, '').replace(/^\//g, ''))
            const target = new URL(url)
            options.target = target.origin
            proxyReq.path = `${target.pathname}${target.search}${target.hash}`
          })
        },
        secure: true
      }
    }
  }
})
