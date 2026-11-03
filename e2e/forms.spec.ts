import { expect, test } from "@playwright/test";
import { expectNoAxeViolations } from "./helpers";

// フォーム送信とエラー表示（作成フォーム・ログイン・設定）。

test.describe("申請の作成フォーム", () => {
    test("未入力で送信するとエラーのまとめと各項目のエラーが出て、まとめの見出しにフォーカスが移る", async ({ page }) => {
        await page.goto("/applications/new");
        await page.getByRole("button", { name: "確認へ進む" }).click();

        const summaryHeading = page.getByRole("heading", { name: /入力内容に \d+ 件の誤りがあります/ });
        await expect(summaryHeading).toBeVisible();
        await expect(summaryHeading).toBeFocused();

        const title = page.getByLabel(/^件名/);
        await expect(title).toHaveAttribute("aria-invalid", "true");
        await expectNoAxeViolations(page, "作成フォーム（エラー）");

        // エラー一覧のリンクで該当項目へ移動できる
        await page.getByRole("link", { name: /^メールアドレス: / }).click();
        await expect(page.getByLabel(/^メールアドレス/)).toBeFocused();
    });

    test("正しく入力すると確認画面を経て完了画面になる", async ({ page }) => {
        await page.goto("/applications/new");
        await page.getByLabel(/^件名/).fill("商店街活性化事業補助金の申請");
        await page.getByRole("radio", { name: "補助金" }).check();
        await page.getByLabel(/^申請額/).fill("1200000");
        await page.getByLabel(/^氏名/).fill("山田 太郎");
        await page.getByLabel(/^メールアドレス/).fill("yamada@example.jp");
        await page.getByLabel(/^希望日/).fill("2099-12-01");
        await page.getByLabel(/^添付ファイル/).setInputFiles({ name: "申請書.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") });
        await page.getByRole("checkbox", { name: "記載内容に誤りがないことを確認しました" }).check();
        await page.getByRole("button", { name: "確認へ進む" }).click();

        await expect(page.getByRole("heading", { name: /確認/ }).first()).toBeVisible();
        await expect(page.getByText("商店街活性化事業補助金の申請")).toBeVisible();
        await expectNoAxeViolations(page, "作成フォーム（確認）");

        await page.getByRole("button", { name: "申請する" }).click();
        await expect(page.getByRole("heading", { name: /申請を受け付けました|完了/ }).first()).toBeVisible();
        await expectNoAxeViolations(page, "作成フォーム（完了）");
    });
});

test.describe("ログイン", () => {
    test("空欄で送信するとエラーが出る", async ({ page }) => {
        await page.goto("/login");
        await page.getByRole("button", { name: "ログイン" }).click();
        await expect(page.getByLabel("メールアドレス")).toHaveAttribute("aria-invalid", "true");
        await expect(page.getByLabel("パスワード", { exact: true })).toHaveAttribute("aria-invalid", "true");
        await expectNoAxeViolations(page, "ログイン（エラー）");
    });

    test("認証に失敗するとバナーが出て、成功するとダッシュボードへ移動する", async ({ page }) => {
        await page.goto("/login");
        await page.getByLabel("メールアドレス").fill("fail@example.go.jp");
        await page.getByLabel("パスワード", { exact: true }).fill("password");
        await page.getByRole("button", { name: "ログイン" }).click();
        await expect(page.getByRole("heading", { name: "メールアドレスまたはパスワードが正しくありません" })).toBeVisible();

        await page.getByLabel("メールアドレス").fill("sato@example.go.jp");
        await page.getByRole("button", { name: "ログイン" }).click();
        await expect(page).toHaveURL(/\/$/);
        await expect(page.getByRole("heading", { level: 1, name: "ダッシュボード" })).toBeVisible();
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
