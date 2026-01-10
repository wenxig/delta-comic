import { invoke } from "@tauri-apps/api/core"

export class ScreenOrientation {
  static async lock(orientation: ScreenOrientationType) {
    return invoke("plugin:delta-comic|screen_orientation_lock", { orientation })
  }

  static async unlock() {
    return invoke("plugin:delta-comic|screen_orientation_unlock")
  }
}
export type ScreenOrientationType = "any" | "landscape" | "landscape-primary" | "landscape-secondary" | "natural" | "portrait" | "portrait-primary" | "portrait-secondary"

export class StatusBar {
  static async setStyle(style: StatusBarStyle) {
    return invoke("plugin:delta-comic|status_bar_set_style", { style })
  }
  static async show() {
    return invoke("plugin:delta-comic|show_status_bar")
  }
  static async hide() {
    return invoke("plugin:delta-comic|hide_status_bar")
  }
  // get_safe_area_insets
  static async getSafeAreaInsets() {
    return invoke<SafeAreaInsets>("plugin:delta-comic|get_safe_area_insets")
  }
}
export enum StatusBarStyle {
  Light = "light",
  Dark = "dark"
}
export interface SafeAreaInsets {
  top: number
  left: number
  bottom: number
  right: number
}