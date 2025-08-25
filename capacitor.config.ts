import type { CapacitorConfig } from '@capacitor/cli'
import { Style } from '@capacitor/status-bar'
import { getNetworkServerUrl } from './script/dev.helper'

const config: CapacitorConfig = {
  appId: 'com.wenxig.deltacomic.app',
  appName: 'delta-comic',
  webDir: 'dist',
  // server: {
  //   cleartext: true,
  //   url: `http://${getNetworkServerUrl()}:5173`
  // },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    StatusBar: {
      overlaysWebView: true,
      style: Style.Light,
      backgroundColor: '#ffffff00'
    }
  },
  zoomEnabled: false
}

export default config
