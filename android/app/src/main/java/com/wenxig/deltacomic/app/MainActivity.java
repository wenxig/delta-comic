package com.wenxig.deltacomic.app;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import androidx.core.view.WindowCompat;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    WebView webView = (WebView) bridge.getWebView();
    webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
  }
}