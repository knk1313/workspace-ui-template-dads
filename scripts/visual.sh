#!/usr/bin/env bash
# 見た目の回帰テストを Playwright 公式の Linux イメージの中で実行する。
# 手元（macOS など）と CI でフォントの描画をそろえ、同じ基準画像で比べるため。
#   scripts/visual.sh                      比較する
#   scripts/visual.sh --update-snapshots   基準画像を撮り直す
# node_modules はホストと OS が違うため、名前付きボリュームに分けて入れる。
set -euo pipefail

IMAGE="mcr.microsoft.com/playwright:v$(node -p "require('./node_modules/@playwright/test/package.json').version")-noble"

docker run --rm --ipc=host \
    -v "$PWD":/work \
    -v workspace-ui-template-node-modules:/work/node_modules \
    -w /work \
    -e CI="${CI:-}" \
    "$IMAGE" \
    /bin/bash -c 'npm ci --no-audit --no-fund --loglevel=error && npx playwright test -c playwright.visual.config.ts "$@"' bash "$@"
