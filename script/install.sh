set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PACKAGE_JSON="$SCRIPT_DIR/../package.json"

if [ ! -f "$PACKAGE_JSON" ]; then
  echo "package.json not found at $PACKAGE_JSON" >&2
  exit 1
fi

if command -v jq >/dev/null 2>&1; then
  TMP="$(mktemp)"
  jq 'if (.dependencies != null and .dependencies["delta-comic-core"] != null) then .dependencies["delta-comic-core"]="latest"
      elif (.devDependencies != null and .devDependencies["delta-comic-core"] != null) then .devDependencies["delta-comic-core"]="latest"
      else .dependencies["delta-comic-core"]="latest" end' "$PACKAGE_JSON" > "$TMP"
  mv "$TMP" "$PACKAGE_JSON"
else
  node -e 'const fs=require("fs");const p=process.argv[1];const pkg=JSON.parse(fs.readFileSync(p)); if(pkg.dependencies && Object.prototype.hasOwnProperty.call(pkg.dependencies,"delta-comic-core")) pkg.dependencies["delta-comic-core"]="latest"; else if(pkg.devDependencies && Object.prototype.hasOwnProperty.call(pkg.devDependencies,"delta-comic-core")) pkg.devDependencies["delta-comic-core"]="latest"; else { pkg.dependencies = pkg.dependencies || {}; pkg.dependencies["delta-comic-core"]="latest"; } fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + "\n");' "$PACKAGE_JSON"
fi