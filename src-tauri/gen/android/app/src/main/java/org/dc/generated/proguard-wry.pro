# THIS FILE IS AUTO-GENERATED. DO NOT MODIFY!!

# Copyright 2020-2023 Tauri Programme within The Commons Conservancy
# SPDX-License-Identifier: Apache-2.0
# SPDX-License-Identifier: MIT

-keep class org.dc.* {
  native <methods>;
}

-keep class org.dc.WryActivity {
  public <init>(...);

  void setWebView(org.dc.RustWebView);
  java.lang.Class getAppClass(...);
  java.lang.String getVersion();
}

-keep class org.dc.Ipc {
  public <init>(...);

  @android.webkit.JavascriptInterface public <methods>;
}

-keep class org.dc.RustWebView {
  public <init>(...);

  void loadUrlMainThread(...);
  void loadHTMLMainThread(...);
  void evalScript(...);
}

-keep class org.dc.RustWebChromeClient,org.dc.RustWebViewClient {
  public <init>(...);
}
