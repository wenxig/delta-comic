set -e

# build Android
cap sync
cap build android

# copy signed APK into dist and rename to app.apk
APK_SRC="./android/app/build/outputs/apk/release/app-release-signed.apk"

if [ -f "$APK_SRC" ]; then
  apksigner sign \
    --ks ./android/keystore.jks \
    --ks-key-alias key0 \
    --ks-pass pass:123456 \
    --key-pass pass:123456 \
    --v1-signing-enabled true \
    --v2-signing-enabled true \
    --v3-signing-enabled true \
    --out app-release.apk \
    "$APK_SRC"
  cp -f "./android/app/build/outputs/apk/release/app-release.apk" dist/app.apk
else
  echo "APK not found at $APK_SRC" >&2
  exit 1
fi