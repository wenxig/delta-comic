use serde::de::DeserializeOwned;
use tauri::{
  plugin::{PluginApi, PluginHandle},
  AppHandle, Runtime,
};

use crate::models::*;

// initializes the Kotlin or Swift plugin classes
pub fn init<R: Runtime, C: DeserializeOwned>(
  _app: &AppHandle<R>,
  api: PluginApi<R, C>,
) -> crate::Result<DeltaComic<R>> {
  #[cfg(target_os = "android")]
  let handle = api.register_android_plugin("com.plugin.deltaComic", "DeltaComicPlugin")?;

  Ok(DeltaComic(handle))
}

/// Access to the deltaComic APIs.
pub struct DeltaComic<R: Runtime>(PluginHandle<R>);

impl<R: Runtime> DeltaComic<R> {
  pub async fn lock_screen_orientation(
    &self,
    payload: ScreenOrientation,
  ) -> crate::Result<()> {
    self
      .0
      .run_mobile_plugin("lockScreenOrientation", payload)
      .map_err(Into::into)
  }
  pub async fn unlock_screen_orientation(&self) -> crate::Result<()> {
    self
      .0
      .run_mobile_plugin("unlockScreenOrientation", ())
      .map_err(Into::into)
  }
  pub async fn set_status_bar_color(
    &self,
    payload: StatusBarColor,
  ) -> crate::Result<()> {
    self
      .0
      .run_mobile_plugin("setStatusBarColor", payload)
      .map_err(Into::into)
  }
  pub async fn show_status_bar(&self) -> crate::Result<()> {
    self
      .0
      .run_mobile_plugin("showStatusBar", ())
      .map_err(Into::into)
  }
  pub async fn hide_status_bar(&self) -> crate::Result<()> {
    self
      .0
      .run_mobile_plugin("hideStatusBar", ())
      .map_err(Into::into)
  }
  pub async fn get_safe_area_insets(&self) -> crate::Result<SafeAreaInsets> {
    self
      .0
      .run_mobile_plugin("getSafeAreaInsets", ())
      .map_err(Into::into)
  }
}
