import { expect, test, type Page } from "@playwright/test";
import { isMobile, waitForLoaded } from "../helpers";

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

const PAGES = [
    { name: "dashboard", path: "/" },
    { name: "applications", path: "/applications" },
    { name: "application-detail", path: "/applications/app-001" },
    { name: "application-form", path: "/applications/new" },
    { name: "settings-profile", path: "/settings" },
    { name: "settings-notifications", path: "/settings?tab=notifications" },
    { name: "settings-display", path: "/settings?tab=display" },
    { name: "login", path: "/login" },
    { name: "not-found", path: "/no-such-page" },
    { name: "server-error", path: "/error/500" },
];

for (const p of PAGES) {
    test(`${p.name}`, async ({ page }) => {
        await open(page, p.path);
        await expect(page).toHaveScreenshot(`${p.name}.png`, { fullPage: true });
    });
}

test("フォームのエラー表示", async ({ page }) => {
    await open(page, "/applications/new");
    await page.getByRole("button", { name: "確認へ進む" }).click();
    await expect(page.getByRole("heading", { name: /件の誤りがあります/ })).toBeFocused();
    await expect(page).toHaveScreenshot("application-form-errors.png", { fullPage: true });
});

test("一括操作と担当者の変更ダイアログ", async ({ page }) => {
    await open(page, "/applications");
    await page.locator("table tbody tr").first().getByRole("checkbox").check();
    await page.getByRole("region", { name: "選択中の項目の操作" }).getByRole("button", { name: "担当者を変更" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page).toHaveScreenshot("applications-assign.png");
});

test("削除のあとの「元に戻す」トースト", async ({ page }) => {
    await open(page, "/applications");
    await page.locator("table tbody tr").first().getByRole("checkbox").check();
    await page.getByRole("region", { name: "選択中の項目の操作" }).getByRole("button", { name: "削除" }).click();
    await expect(page.getByRole("button", { name: "元に戻す" })).toBeVisible();
    await expect(page).toHaveScreenshot("applications-undo-toast.png");
});

test("読み込めなかったときのエラー表示", async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem("mock-api-options", JSON.stringify({ fail: true, slow: false })));
    await page.clock.setFixedTime(FIXED_NOW);
    await page.goto("/applications");
    await expect(page.getByRole("heading", { name: "申請の一覧を読み込めませんでした" })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot("applications-load-error.png", { fullPage: true });
});

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

    test("申請の作成（ステップ・ラジオボタン）", async ({ page }) => {
        await open(page, "/applications/new");
        await page.getByRole("radio", { name: "補助金" }).check();
        await expect(page).toHaveScreenshot("forced-colors-form.png");
    });

    test("申請一覧（行の選択・現在地）", async ({ page }) => {
        await open(page, "/applications");
        await page.locator("table tbody tr").first().getByRole("checkbox").check();
        await expect(page).toHaveScreenshot("forced-colors-applications.png");
    });
});
