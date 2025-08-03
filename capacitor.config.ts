import type { CapacitorConfig } from '@capacitor/cli'
import { getNetworkServerUrl } from './script/dev.helper'
const config: CapacitorConfig = {
  appId: 'com.wenxig.deltacomic.app',
  appName: 'delta-comic',
  webDir: 'dist',
  server: {
    cleartext: true,
    url: `http://${getNetworkServerUrl()}:5173`
  }
}

export default config
