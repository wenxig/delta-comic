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
  },
  zoomEnabled: false
}

export default config
