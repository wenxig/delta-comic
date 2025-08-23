import { createApp, defineComponent, } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import { router } from "./router"
import "@/index.css"
import '@vant/touch-emulator'
import { ConfigProvider as VanConfigProvider, type ConfigProviderThemeVars } from 'vant'
import { NConfigProvider, NMessageProvider, NDialogProvider, NLoadingBarProvider, zhCN, type GlobalThemeOverrides } from 'naive-ui'
import Color from "color"
import { reactiveComputed, useCssVar } from "@vueuse/core"
import { useConfig } from "./config"
import 'core-js'
Map.prototype.toJSON = function () {
  return ([...this.entries()])
}
Set.prototype.toJSON = function () {
  return ([...this.values()])
}

import { SafeArea, type SafeAreaInsets } from 'capacitor-plugin-safe-area'
const handleSafeAreaChange = (data: SafeAreaInsets) => {
  const { insets } = data
  for (const [key, value] of Object.entries(insets)) {
    console.log(
      `--safe-area-inset-${key}`,
      `${value}px`,)
    document.documentElement.style.setProperty(
      `--safe-area-inset-${key}`,
      `${value}px`,
    )
  }
}
SafeArea.getSafeAreaInsets().then(handleSafeAreaChange)
SafeArea.addListener('safeAreaChanged', handleSafeAreaChange)

const app = createApp(
  defineComponent(() => {
    const config = useConfig()
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
            } as ConfigProviderThemeVars} class="h-full overflow-hidden" theme={config.isDark ? 'dark' : 'light'} themeVarsScope="global" >
              <NMessageProvider max={5} to="#messages">
                <App />
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
app.mount("#app")
