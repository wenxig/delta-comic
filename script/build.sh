set -e

sh ./build.web.sh
wait

sh ./build.apk.sh
wait
