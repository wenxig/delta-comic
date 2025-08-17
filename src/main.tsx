import { createApp, defineComponent, } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import { router } from "./router"
import "@/index.css"
import '@vant/touch-emulator'
// import 'core-js'
import { ConfigProvider as VanConfigProvider, type ConfigProviderThemeVars } from 'vant'
import { NConfigProvider, NMessageProvider, NDialogProvider, NLoadingBarProvider, zhCN, type GlobalThemeOverrides } from 'naive-ui'
import Color from "color"
import { reactiveComputed, useCssVar } from "@vueuse/core"
import { useConfig } from "./config"

Map.prototype.toJSON = function () {
  return ([...this.entries()])
}
Set.prototype.toJSON = function () {
  return ([...this.values()])
}
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

              // fontSizeXs: 'var(--nui-font-size-tiny)',
              // fontSizeSm: 'var(--nui-font-size-small)',
              // fontSizeMd: 'var(--nui-font-size-medium)',
              // fontSizeLg: 'var(--nui-font-size-large)',
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
