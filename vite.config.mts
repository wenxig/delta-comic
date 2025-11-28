import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import MotionResolver from 'motion-v/resolver'
import { NaiveUiResolver, VantResolver } from 'unplugin-vue-components/resolvers'
import tailwindcss from '@tailwindcss/vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { browserslistToTargets } from 'lightningcss'
import browserslist from 'browserslist'
import { vite as vidstack } from 'vidstack/plugins'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    // basicSsl({
    //   /** name of certification */
    //   name: 'delta-comic',
    //   /** custom trust domains */
    //   domains: ['*.localhost.com', '*.localhost.org', '*.localhost.net'],
    //   /** custom certification directory */
    //   certDir: './public/cert',
    // }),
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('media-'),
        },
      },
    }),
    vidstack({
      include: /.+\.v\./
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
      targets: browserslistToTargets(browserslist('> 5%'))
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
  }
})
