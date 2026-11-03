import { expect, test } from "@playwright/test";
import { expectNoAxeViolations } from "./helpers";

// フォーム送信とエラー表示（ログイン・設定）。見本の申請の作成フォームは e2e/samples/ にある。

test.describe("ログイン", () => {
    test("空欄で送信するとエラーが出る", async ({ page }) => {
        await page.goto("/login");
        await page.getByRole("button", { name: "ログイン" }).click();
        await expect(page.getByLabel("メールアドレス")).toHaveAttribute("aria-invalid", "true");
        await expect(page.getByLabel("パスワード", { exact: true })).toHaveAttribute("aria-invalid", "true");
        await expectNoAxeViolations(page, "ログイン（エラー）");
    });

    test("認証に失敗するとバナーが出て、成功するとホームへ移動する", async ({ page }) => {
        await page.goto("/login");
        await page.getByLabel("メールアドレス").fill("fail@example.go.jp");
        await page.getByLabel("パスワード", { exact: true }).fill("password");
        await page.getByRole("button", { name: "ログイン" }).click();
        await expect(page.getByRole("heading", { name: "メールアドレスかパスワードが違います" })).toBeVisible();

        await page.getByLabel("メールアドレス").fill("sato@example.go.jp");
        await page.getByRole("button", { name: "ログイン" }).click();
        await expect(page).toHaveURL(/\/$/);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
});

test("設定画面でレイアウトを上部ナビゲーション型に変えると、ヘッダーに水平メニューが出る", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 1024, "水平メニューはデスクトップ幅だけ");
    await page.goto("/settings?tab=display");
    await page.getByRole("radio", { name: /上部ナビゲーション型/ }).check();
    await page.getByRole("button", { name: "保存する" }).click();
    await expect(page.getByRole("banner").getByRole("navigation")).toBeVisible();
    await expectNoAxeViolations(page, "上部ナビゲーション型");
});
