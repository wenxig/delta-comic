use tauri::{
  plugin::{Builder, TauriPlugin},
  Manager, Runtime,
};

pub use models::*;

#[cfg(desktop)]
mod desktop;
#[cfg(mobile)]
mod mobile;

mod commands;
mod error;
mod models;

pub use error::{Error, Result};

#[cfg(desktop)]
use desktop::DeltaComic;
#[cfg(mobile)]
use mobile::DeltaComic;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the delta_comic APIs.
pub trait DeltaComicExt<R: Runtime> {
  fn delta_comic(&self) -> &DeltaComic<R>;
}

impl<R: Runtime, T: Manager<R>> crate::DeltaComicExt<R> for T {
  fn delta_comic(&self) -> &DeltaComic<R> {
    self.state::<DeltaComic<R>>().inner()
  }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("delta_comic")
    .invoke_handler(tauri::generate_handler![
      commands::lock_screen_orientation,
      commands::unlock_screen_orientation,
      commands::set_status_bar_color,
      commands::show_status_bar,
      commands::hide_status_bar,
      commands::get_safe_area_insets
    ])
    .setup(|app, api| {

      #[cfg(target_os = "android")]
      let delta_comic = mobile::init(app, api)?;

      #[cfg(not(target_os = "android"))]
      let delta_comic = desktop::init(app, api)?;

      app.manage(delta_comic);
      Ok(())
    })
    .build()
}
