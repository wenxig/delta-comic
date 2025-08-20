import type { CapacitorConfig } from '@capacitor/cli'
import { getNetworkServerUrl } from './script/dev.helper'
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
      backgroundColor: "#ffffff00"
    }
  },
  zoomEnabled: false
}

export default config
