const COMMANDS: &[&str] = &[
  "lock_screen_orientation",
  "unlock_screen_orientation",
  "set_status_bar_color",
  "show_status_bar",
  "hide_status_bar",
  "get_safe_area_insets"
];

fn main() {
  tauri_plugin::Builder::new(COMMANDS)
    .android_path("android")
    .ios_path("ios")
    .build();
}
