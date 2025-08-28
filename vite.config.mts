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
import comments from 'vite-plugin-isdev'

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
    comments(),
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