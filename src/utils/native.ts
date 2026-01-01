import { invoke } from '@tauri-apps/api/core'

export class SafeArea {
  public static getSafeAreaInsets() {
    return invoke<SafeAreaInsets>('getSafeAreaInsets')
  }
}

export interface SafeAreaInsets {
  top: number
  bottom: number
  left: number
  right: number
}

export class StatusBar {
  public static setStyle(style: { style: StatusBarStyle }) {

  }
}

export enum StatusBarStyle {
  Dark = 'dark',
  Light = 'light'
}


export class ScreenOrientation {
  public static lock(orientation: "any" | "landscape" | "landscape-primary" | "landscape-secondary" | "natural" | "portrait" | "portrait-primary" | "portrait-secondary") {

  }
  public static unlock() {

  }
}