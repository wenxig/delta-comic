use serde::de::DeserializeOwned;
use tauri::{plugin::PluginApi, AppHandle, Runtime};

use crate::models::*;

pub fn init<R: Runtime, C: DeserializeOwned>(
  app: &AppHandle<R>,
  _api: PluginApi<R, C>,
) -> crate::Result<DeltaComic<R>> {
  Ok(DeltaComic(app.clone()))
}

/// Access to the DeltaComic APIs.
pub struct DeltaComic<R: Runtime>(AppHandle<R>);

impl<R: Runtime> DeltaComic<R> {
  pub async fn lock_screen_orientation(&self, _payload: ScreenOrientation) -> crate::Result<()> {
    Ok(())
  }
  pub async fn unlock_screen_orientation(&self) -> crate::Result<()> {
    Ok(())
  }
  pub async fn set_status_bar_color(&self, _payload: StatusBarColor) -> crate::Result<()> {
    Ok(())
  }
  pub async fn show_status_bar(&self) -> crate::Result<()> {
    Ok(())
  }
  pub async fn hide_status_bar(&self) -> crate::Result<()> {
    Ok(())
  }
  pub async fn get_safe_area_insets(&self) -> crate::Result<SafeAreaInsets> {
    Ok(SafeAreaInsets {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    })
  }
}
