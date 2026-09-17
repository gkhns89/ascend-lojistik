#!/bin/sh
# Kalici disk (Railway volume, docker volume, bind mount) bos ve root sahipli
# baglanir; bu, imajda yapilan chown'un uzerini orter. Boyle bir durumda portal
# acilista "unable to open database file" ile coker.
#
# Bu betik root olarak calisir, yalnizca veri ve yedek dizinlerinin sahipligini
# duzeltir, sonra sunucuyu node kullanicisina dusurerek baslatir. Dizin zaten
# dogru sahipliyse islem etkisizdir.
set -eu

ensure_dir() {
  dir=$1
  [ -n "$dir" ] || return 0
  mkdir -p "$dir"
  chown node:node "$dir"
}

ensure_dir "$(dirname "${PORTAL_DATA_FILE:-/app/.data/portal.json}")"
ensure_dir "${PORTAL_BACKUP_DIRECTORY:-}"

exec su-exec node:node "$@"
