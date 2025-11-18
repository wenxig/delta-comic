import type { CapacitorConfig } from '@capacitor/cli'
import { Style } from '@capacitor/status-bar'
import { KeyboardResize } from '@capacitor/keyboard'
import { getNetworkServerUrl } from './script/dev.helper'
const isDev = process.env.CAPACITOR_IS_DEV === 'true'
const config: CapacitorConfig = {
  appId: 'com.wenxig.deltacomic.app',
  appName: 'delta-comic',
  webDir: isDev ? undefined : 'dist',
  server: {
    cleartext: true,
    url: isDev ? `https://${getNetworkServerUrl()}:5173` : undefined
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    StatusBar: {
      overlaysWebView: true,
      style: Style.Light,
      backgroundColor: '#ffffff00'
    },
    Keyboard: {
      resize: KeyboardResize.Native,
    }
  },
  zoomEnabled: false,
  android: {
    buildOptions: {
      keystoreAlias: 'key0',
      keystorePath: 'keystore.jks',
      keystoreAliasPassword: '123456',
      keystorePassword: '123456',
      releaseType: 'APK',
      // signingType: 'apksigner'
    }
  }
}
console.log(process.env.CAPACITOR_IS_DEV, isDev, config)
export default config
