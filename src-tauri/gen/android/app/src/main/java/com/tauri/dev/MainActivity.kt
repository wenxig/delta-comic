package com.tauri.dev

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import com.delta.space.systemui.StatusBarPlugin

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    
  }
}
