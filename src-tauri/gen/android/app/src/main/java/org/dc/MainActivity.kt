package org.dc

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import org.dc.helper.StatusBar

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    
  }
}
