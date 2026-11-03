import { defineConfig, devices } from "@playwright/test";

// 見た目の回帰テスト（スクリーンショットの比較）。
// フォントの描画を環境でそろえるため、Playwright 公式の Linux イメージの中で実行する（`npm run test:visual`。scripts/visual.sh）。
// 画面を意図して変えたときは `npm run test:visual:update` で基準画像を撮り直し、差分を確認してからコミットする。
export default defineConfig({
    testDir: "./e2e/visual",
    snapshotPathTemplate: "{testDir}/__screenshots__/{projectName}/{arg}{ext}",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: process.env.CI ? 4 : undefined,
    reporter: process.env.CI ? [["github"], ["list"]] : "list",
    expect: {
        toHaveScreenshot: {
            animations: "disabled",
            caret: "hide",
            // アンチエイリアスの揺れは許し、1px 単位のずれは検出する
            maxDiffPixels: 0,
            threshold: 0.1,
        },
    },
    use: {
        baseURL: "http://localhost:4173",
        locale: "ja-JP",
        timezoneId: "Asia/Tokyo",
    },
    projects: [
        { name: "desktop", use: { ...devices["Desktop Chrome"] } },
        { name: "mobile", use: { ...devices["Pixel 7"] } },
    ],
    webServer: {
        command: "npm run build && npm run preview -- --port 4173 --strictPort",
        url: "http://localhost:4173",
        reuseExistingServer: false,
        timeout: 120000,
    },
});
