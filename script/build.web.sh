set -e

vite build

# create a stored (no compression) zip of the contents of dist
if [ -d "dist" ]; then
  (cd dist && zip -r -0 ../dist.zip ./*)
  mv -f dist.zip dist/dist.zip
else
  echo "dist directory not found" >&2
  exit 1
fi