import type { CapacitorConfig } from '@capacitor/cli'
import "@capacitor/status-bar"
const config: CapacitorConfig = {
  appId: 'com.wenxig.deltacomic.app',
  appName: 'delta-comic',
  webDir: 'dist',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    StatusBar: {
      overlaysWebView: true,
      style: "DARK",

    }
  },
  zoomEnabled: false
}

export default config
