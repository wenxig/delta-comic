use tauri::{command, AppHandle, Runtime};

use crate::models::*;
use crate::DeltaComicExt;
use crate::Result;

#[command]
pub(crate) async fn lock_screen_orientation<R: Runtime>(
  app: AppHandle<R>,
  payload: ScreenOrientation,
) -> Result<()> {
  app.delta_comic().lock_screen_orientation(payload).await
}

#[command]
pub async fn unlock_screen_orientation<R: Runtime>(app: AppHandle<R>) -> Result<()> {
  app.delta_comic().unlock_screen_orientation().await
}

#[command]
pub async fn set_status_bar_color<R: Runtime>(app: AppHandle<R>, payload: StatusBarColor) -> Result<()> {
  app.delta_comic().set_status_bar_color(payload).await
}

#[command]
pub async fn show_status_bar<R: Runtime>(app: AppHandle<R>) -> Result<()> {
  app.delta_comic().show_status_bar().await
}

#[command]
pub async fn hide_status_bar<R: Runtime>(app: AppHandle<R>) -> Result<()> {
  app.delta_comic().hide_status_bar().await
}

#[command]
pub async fn get_safe_area_insets<R: Runtime>(app: AppHandle<R>) -> Result<SafeAreaInsets> {
  app.delta_comic().get_safe_area_insets().await
}
