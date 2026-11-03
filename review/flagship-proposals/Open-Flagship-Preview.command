#!/bin/zsh
set -eu
PREVIEW_DIRECTORY="${0:A:h}"
exec /opt/homebrew/opt/node@24/bin/node "$PREVIEW_DIRECTORY/preview.mjs"
