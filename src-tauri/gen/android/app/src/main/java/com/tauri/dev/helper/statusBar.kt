package com.delta.space.systemui

import android.app.Activity
import android.graphics.Color
import android.view.WindowInsets
import androidx.core.view.WindowCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import app.tauri.annotation.Command

/** Android StatusBar 控制插件 */
object StatusBarPlugin {
  /** 获取当前 safe area inset（px） */
  @Command
  fun getSafeAreaInsets(activity: Activity): Map<String, Int> {
    val decorView = activity.window.decorView

    val insets = ViewCompat.getRootWindowInsets(decorView) ?: return emptyInsets()

    val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())

    return mapOf(
      "top" to systemBars.top,
      "bottom" to systemBars.bottom,
      "left" to systemBars.left,
      "right" to systemBars.right
    )
  }

  private fun emptyInsets(): Map<String, Int> {
    return mapOf("top" to 0, "bottom" to 0, "left" to 0, "right" to 0)
  }


  /**
   * 设置状态栏颜色
   *
   * @param color 颜色字符串，如 "#ffffff"
   * @param darkIcons 是否使用深色图标
   */
  @Command
  fun setStatusBarColor(activity: Activity, style: String) {
    val window = activity.window

    val controller = WindowCompat.getInsetsController(window, window.decorView)

    when (style.lowercase()) {
      "dark" -> {
        // 深色风格 = 白色图标
        controller.isAppearanceLightStatusBars = false
      }
      "light" -> {
        // 浅色风格 = 深色图标
        controller.isAppearanceLightStatusBars = true
      }
      else -> {
        throw IllegalArgumentException("Unknown status bar style: $style")
      }
    }
  }
}
