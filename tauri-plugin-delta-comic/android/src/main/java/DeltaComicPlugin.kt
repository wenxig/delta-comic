package com.plugin.deltaComic

import android.app.Activity
import android.content.pm.ActivityInfo
import app.tauri.annotation.Command
import app.tauri.annotation.InvokeArg
import app.tauri.annotation.TauriPlugin
import app.tauri.plugin.Invoke
import app.tauri.plugin.Plugin
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import app.tauri.plugin.JSObject

@InvokeArg
internal class StatusBarColor {
  lateinit var style: String
}

@InvokeArg
internal class ScreenOrientation {
  lateinit var orientation: String
}

@TauriPlugin
class DeltaComicPlugin(private val activity: Activity): Plugin(activity) {
  companion object {
    private const val TAG = "DeltaComicPlugin"
  }

  @Command
  fun lockScreenOrientation(invoke: Invoke) {
    val args = invoke.parseArgs(ScreenOrientation::class.java)

    activity.requestedOrientation =
      when (args.orientation.lowercase()) {
        // 解锁
        "any" -> ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED

        // 纵向
        "portrait",
        "portrait-primary",
        -> ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
        "portrait-secondary" -> ActivityInfo.SCREEN_ORIENTATION_REVERSE_PORTRAIT

        // 横向
        "landscape",
        "landscape-primary",
        -> ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
        "landscape-secondary" -> ActivityInfo.SCREEN_ORIENTATION_REVERSE_LANDSCAPE

        // Android 无 natural 概念，退化处理
        "natural" -> ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
        else -> return invoke.reject("Unsupported orientation: ${args.orientation}")
      }
    invoke.resolve()
  }

  @Command
  fun unlockScreenOrientation(invoke: Invoke) {
    activity.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
    invoke.resolve()
  }

  @Command
  fun getSafeAreaInsets(invoke: Invoke): Unit {
    val decorView = activity.window.decorView

    val insets = ViewCompat.getRootWindowInsets(decorView) ?: return invoke.resolve(emptyInsets())

    val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())

    val result = JSObject()

    result.put("top", systemBars.top)
    result.put("bottom", systemBars.bottom)
    result.put("left", systemBars.left)
    result.put("right", systemBars.right)

    return invoke.resolve(result)
  }

  private fun emptyInsets(): JSObject {
    val result = JSObject()

    result.put("top", 0)
    result.put("bottom", 0)
    result.put("left", 0)
    result.put("right", 0)
    return result
  }

  @Command
  fun setStatusBarColor(invoke: Invoke) {
    val args = invoke.parseArgs(StatusBarColor::class.java)

    val window = activity.window

    val controller = WindowCompat.getInsetsController(window, window.decorView)

    when (args.style.lowercase()) {
      "dark" -> {
        // 深色风格 = 白色图标
        controller.isAppearanceLightStatusBars = false
      }
      "light" -> {
        // 浅色风格 = 深色图标
        controller.isAppearanceLightStatusBars = true
      }
      else -> {
        return invoke.reject("Unknown status bar style: ${args.style}")
      }
    }
    invoke.resolve()
  }

  @Command
  fun hideStatusBar(invoke: Invoke) {
    val window = activity.window

    // 允许内容延伸到 system bars 下方
    WindowCompat.setDecorFitsSystemWindows(window, true)

    val controller = WindowCompat.getInsetsController(window, window.decorView)

    controller.hide(WindowInsetsCompat.Type.statusBars())
    invoke.resolve()
  }

  @Command
  fun showStatusBar(invoke: Invoke) {
    val window = activity.window

    WindowCompat.setDecorFitsSystemWindows(window, true)

    val controller = WindowCompat.getInsetsController(window, window.decorView)

    controller.show(WindowInsetsCompat.Type.statusBars())
    invoke.resolve()
  }
}
