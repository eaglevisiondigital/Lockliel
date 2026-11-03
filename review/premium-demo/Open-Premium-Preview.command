#!/bin/zsh
set -eu
cd -- "$(dirname -- "$0")"
exec /opt/homebrew/opt/node@24/bin/node preview.mjs
