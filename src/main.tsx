import "./lib"

import * as c from 'delta-comic-core'
window.$api.c = c
import "./plugin"
import { createApp, defineComponent, } from "vue"
import { createPinia } from "pinia"
import { router } from "./router"
import "@/index.css"
import { ConfigProvider as VanConfigProvider, type ConfigProviderThemeVars } from 'vant'
import { NConfigProvider, NMessageProvider, NDialogProvider, NLoadingBarProvider, zhCN, type GlobalThemeOverrides } from 'naive-ui'
import Color from "color"
import { reactiveComputed, useCssVar } from "@vueuse/core"
import { SafeArea, type SafeAreaInsets } from 'capacitor-plugin-safe-area'
import AppSetup from "./AppSetup.vue"
import localforage from 'localforage'
import { favouriteDB } from "./db/favourite"
document.addEventListener('contextmenu', e => e.preventDefault())
await localforage.ready()
const handleSafeAreaChange = ({ insets }: SafeAreaInsets) => {
  for (const [key, value] of Object.entries(insets)) document.documentElement.style.setProperty(
    `--safe-area-inset-${key}`,
    `${value}px`,
  )
}
await SafeArea.getSafeAreaInsets().then(handleSafeAreaChange)
SafeArea.addListener('safeAreaChanged', handleSafeAreaChange)

const app = createApp(
  defineComponent(() => {

    const themeColor = Color('#fb7299').hex()
    const themeColorLight = Color(themeColor).lighten(0.2).hex()
    const themeColorDark = Color(themeColor).darken(0.2).hex()
    const themeOverrides = reactiveComputed<GlobalThemeOverrides>(() => ({
      common: {
        primaryColor: themeColor,
        primaryColorHover: themeColorLight,
        primaryColorPressed: themeColorDark,
        primaryColorSuppl: themeColorDark
      }
    }))
    const fontBold = useCssVar('--nui-font-weight')
    return () => (
      <NConfigProvider locale={zhCN} abstract themeOverrides={themeOverrides}>
        <NLoadingBarProvider container-class="z-200000">
          <NDialogProvider to="#popups">
            <VanConfigProvider themeVars={{

              blue: themeColor,
              green: themeOverrides.common?.successColor,
              red: themeOverrides.common?.errorColor,
              orange: themeOverrides.common?.warningColor,

              baseFont: 'var(--nui-font-family)',
              priceFont: 'var(--font-family-mono)',

              fontBold: fontBold.value
            } as ConfigProviderThemeVars} class="h-full overflow-hidden" theme="light" themeVarsScope="global" >
              <NMessageProvider max={5} to="#messages">
                <AppSetup />
              </NMessageProvider>
            </VanConfigProvider>
          </NDialogProvider>
        </NLoadingBarProvider>
      </NConfigProvider>
    )
  })
)

const pinia = createPinia()
app.use(pinia)
app.use(router)
await favouriteDB.$init()
app.mount("#app")
