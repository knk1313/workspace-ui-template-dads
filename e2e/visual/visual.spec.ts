import { expect, test, type Page } from "@playwright/test";
import { isMobile, waitForLoaded } from "../helpers";
import { PAGES } from "../routes";

// 主要な画面と、開いた状態の見た目を基準画像と比べる。
// 基準画像は e2e/visual/__screenshots__/ にあり、Linux コンテナの中で撮る（playwright.visual.config.ts）。

// 日付を固定する（「今日」を使う表示があっても画像が変わらないように）。タイマーは止めない。
const FIXED_NOW = new Date("2026-11-04T10:00:00+09:00");

async function open(page: Page, path: string) {
    await page.clock.setFixedTime(FIXED_NOW);
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await waitForLoaded(page);
    await page.evaluate(() => document.fonts.ready);
}

for (const p of PAGES) {
    test(`${p.name}`, async ({ page }) => {
        await open(page, p.path);
        await expect(page).toHaveScreenshot(`${p.name}.png`, { fullPage: true });
    });
}

test("ヘッダーのメニュー", async ({ page }) => {
    await open(page, "/");
    if (isMobile(page)) {
        await page.getByRole("button", { name: "メニュー", exact: true }).click();
        await expect(page.getByRole("dialog", { name: "メニュー" })).toBeVisible();
        await expect(page).toHaveScreenshot("mobile-drawer.png");
    } else {
        await page.getByRole("button", { name: /お知らせ/ }).click();
        await expect(page).toHaveScreenshot("notifications.png");
    }
});

test.describe("強制カラーモード（Windowsのハイコントラストなど）", () => {
    test.beforeEach(async ({ page }) => {
        await page.emulateMedia({ forcedColors: "active" });
    });

    test("通知の設定（スイッチ・チェックボックス・タブ）", async ({ page }) => {
        await open(page, "/settings?tab=notifications");
        await expect(page).toHaveScreenshot("forced-colors-settings.png");
    });
});
