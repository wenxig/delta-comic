import type { CapacitorConfig } from '@capacitor/cli'
import { Style } from '@capacitor/status-bar'
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
      style: Style.Light,
      backgroundColor:'#ffffff00'
    }
  },
  zoomEnabled: false
}

export default config
