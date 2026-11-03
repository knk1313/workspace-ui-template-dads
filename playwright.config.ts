import { defineConfig, devices } from "@playwright/test";

// E2E テスト（主要ページの表示、ナビゲーション、フォーム、テーブル、モーダル、モバイル幅、axe）。
// `npm run test:e2e`。初回は `npm run test:e2e:install` で Chromium を入れる。
export default defineConfig({
    testDir: "./e2e",
    // 見た目の回帰テストは Linux コンテナで別に実行する（playwright.visual.config.ts）
    testIgnore: "visual/**",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    // CI のランナーは 4 コア。既定（コア数の半分）より多く並べ、E2E の時間を縮める
    workers: process.env.CI ? 4 : undefined,
    reporter: process.env.CI ? [["github"], ["list"]] : "list",
    use: {
        baseURL: "http://localhost:4173",
        trace: "on-first-retry",
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
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
});
