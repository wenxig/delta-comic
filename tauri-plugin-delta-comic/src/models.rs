use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StatusBarColor {
  pub style: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScreenOrientation {
  pub orientation: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SafeAreaInsets {
  pub top: u32,
  pub bottom: u32,
  pub left: u32,
  pub right: u32,
}
