import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type ProxyOptions } from 'vite'
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
const createProxy = (pRaw: Record<string, string>): Record<string, ProxyOptions> => {
  const p: Record<string, ProxyOptions> = {}
  for (const key in pRaw) {
    if (Object.prototype.hasOwnProperty.call(pRaw, key)) {
      const target = pRaw[key]
      p[key] = {
        changeOrigin: true,
        target,
        rewrite: path => path.replaceAll(key, ''),
        
      }

    }
  }
  return p
}
export default defineConfig({
  plugins: [
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
    legacyPlugin({
      targets: ['defaults', 'ie >= 11', 'chrome 52'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderLegacyChunks: true,
      renderModernChunks: false,
    }),
    tailwindcss()
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
      targets: browserslistToTargets(browserslist('> 1%, last 2 versions, not ie <= 8'))
    }
  },
  base: "/",
  server: {
    strictPort: true,
    port: 5173,
    host: true,
    proxy: createProxy({
      '/$eh': 'https://e-hentai.org',
      '/$ex': 'https://exhentai.org',
      '/$bk_api': 'https://api.go2778.com',
      '/$bk_recommend': 'https://recommend.go2778.com',
      '/$jm_api':'https://www.cdnmhwscc.vip'
    })
  }
})