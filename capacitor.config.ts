import type { CapacitorConfig } from '@capacitor/cli'
import { Style } from '@capacitor/status-bar'
import { getNetworkServerUrl } from './script/dev.helper'
const isDev = process.env.CAPACITOR_IS_DEV == 'true'
const config: CapacitorConfig = {
  appId: 'com.wenxig.deltacomic.app',
  appName: 'delta-comic',
  webDir: 'dist',
  server: isDev ? {
    cleartext: true,
    url: `http://${getNetworkServerUrl()}:5173`
  } : undefined,
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    CapacitorSQLite: {
      androidIsEncryption: true,
      androidBiometric: {
        biometricAuth: true,
        biometricTitle: "生物识别认证",
        biometricSubTitle: "生物识别认证以解锁应用数据"
      },
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
