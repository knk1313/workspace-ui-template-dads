import { expect, test, type Page } from "@playwright/test";
import { waitForLoaded } from "../helpers";

// 見本の申請管理の画面の、開いた状態の見た目（基準画像と比べる）。
// npm run remove-samples を実行すると、このファイルと基準画像が消える。

// 日付を固定する（「今日」を使う表示があっても画像が変わらないように）。タイマーは止めない。
const FIXED_NOW = new Date("2026-11-04T10:00:00+09:00");

async function open(page: Page, path: string) {
    await page.clock.setFixedTime(FIXED_NOW);
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await waitForLoaded(page);
    await page.evaluate(() => document.fonts.ready);
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

test.describe("強制カラーモード（見本の画面）", () => {
    test.beforeEach(async ({ page }) => {
        await page.emulateMedia({ forcedColors: "active" });
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
