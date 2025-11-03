set -e

# build Android
cap sync
cap build android

# copy signed APK into dist and rename to app.apk
APK_SRC="./android/app/build/outputs/apk/release/app-release-signed.apk"
if [ -f "$APK_SRC" ]; then
  cp -f "$APK_SRC" dist/app.apk
else
  echo "APK not found at $APK_SRC" >&2
  exit 1
fi