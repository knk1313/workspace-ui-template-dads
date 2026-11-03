import { expect, test, type Locator, type Page } from "@playwright/test";
import { expectNoAxeViolations, isMobile, waitForLoaded } from "../helpers";
import { findMisalignments } from "../layout";

// 見本の申請管理の画面（一覧の表・ダイアログ・作成フォーム）の操作の検査。
// npm run remove-samples を実行すると、このディレクトリごと消える。

async function open(page: Page, path: string) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await waitForLoaded(page);
}

// 一覧表の並べ替え・ページ送り、モーダルダイアログのフォーカス管理。

async function numbers(page: Page): Promise<string[]> {
    return page.locator("table tbody th a").allTextContents();
}

test.describe("申請一覧の表", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/applications");
        await expect(page.locator("table tbody th a").first()).toBeVisible();
    });

    test("列見出しで並べ替えると順序とaria-sortが変わる", async ({ page }) => {
        const header = page.getByRole("columnheader", { name: /受付番号/ });
        await page.getByRole("button", { name: /^受付番号・件名/ }).click();
        await expect(header).toHaveAttribute("aria-sort", "ascending");
        const asc = await numbers(page);
        expect([...asc].sort()).toEqual(asc);

        await page.getByRole("button", { name: /^受付番号・件名/ }).click();
        await expect(header).toHaveAttribute("aria-sort", "descending");
        const desc = await numbers(page);
        expect([...desc].sort().reverse()).toEqual(desc);
    });

    test("ページ送りで表示行が変わり、現在のページが示される", async ({ page }) => {
        const first = await numbers(page);
        await expect(page.getByText("全64件中1〜20件")).toBeVisible();
        await page.getByRole("navigation", { name: "ページ送り" }).getByRole("button", { name: /2/ }).first().click();
        await expect(page.getByText("全64件中21〜40件")).toBeVisible();
        const second = await numbers(page);
        expect(second).not.toEqual(first);
        await expect(page.getByRole("navigation", { name: "ページ送り" }).locator("[aria-current='page']")).toHaveText(/2/);
    });

    test("PC幅では表が横にはみ出さない", async ({ page }) => {
        test.skip(isMobile(page), "PC幅だけ");
        const overflow = await page.locator("table").evaluate((t) => t.parentElement!.scrollWidth - t.parentElement!.clientWidth);
        expect(overflow).toBeLessThanOrEqual(0);
    });

    test("行を選ぶと一括操作が現れ、担当者変更のモーダルはフォーカスを閉じ込め、Escで閉じて元のボタンへ戻る", async ({ page }) => {
        await page.locator("table tbody tr").first().getByRole("checkbox").check();
        const region = page.getByRole("region", { name: "選択中の項目の操作" });
        await expect(region).toBeVisible();

        const trigger = region.getByRole("button", { name: "担当者を変更" });
        await trigger.click();
        const dialog = page.getByRole("dialog", { name: "担当者を変更" });
        await expect(dialog).toBeVisible();
        await expectNoAxeViolations(page, "担当者変更のモーダル");

        // 開いた直後は見出しにフォーカスがあり、Tab を何度押してもダイアログの外に出ない
        await expect(dialog.getByRole("heading", { name: "担当者を変更" })).toBeFocused();
        for (let i = 0; i < 8; i++) {
            await page.keyboard.press("Tab");
            expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
        }

        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
        await expect(trigger).toBeFocused();
    });

    test("一括削除は確認なしですぐ行われ、トーストの「元に戻す」で取り消せる", async ({ page }) => {
        const before = await numbers(page);
        await page.locator("table tbody tr").first().getByRole("checkbox").check();
        await page.getByRole("region", { name: "選択中の項目の操作" }).getByRole("button", { name: "削除" }).click();
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await expect(page.getByText(`${before[0]}を削除しました`)).toBeVisible();
        await expect(page.getByText("全63件", { exact: true })).toBeVisible();
        expect(await numbers(page)).not.toContain(before[0]);
        // 消えた行にあったフォーカスは「元に戻す」へ移り、キーボードの Enter で取り消せる
        await expect(page.getByRole("button", { name: "元に戻す" })).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(page.getByText(`${before[0]}を元に戻しました`)).toBeVisible();
        await expect(page.getByText("全64件", { exact: true })).toBeVisible();
        expect(await numbers(page)).toContain(before[0]);
    });
});

test("申請詳細：差戻しのモーダルは理由が空だとエラーを出し、入力すると警告バナーが出る", async ({ page }) => {
    await page.goto("/applications/app-001");
    await page.getByRole("button", { name: "その他の操作" }).click();
    const item = page.getByRole("menuitem", { name: "差戻し" });
    test.skip((await item.count()) === 0, "この申請の状態では差戻しできない");
    await item.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "差し戻す" }).click();
    await expect(dialog.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    await dialog.getByRole("textbox").fill("添付書類が不足しています。");
    await dialog.getByRole("button", { name: "差し戻す" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText("添付書類が不足しています。")).toBeVisible();
});

test.describe("申請の作成フォーム", () => {
    test("未入力で送信するとエラーのまとめと各項目のエラーが出て、まとめの見出しにフォーカスが移る", async ({ page }) => {
        await page.goto("/applications/new");
        await page.getByRole("button", { name: "確認へ進む" }).click();

        const summaryHeading = page.getByRole("heading", { name: /入力内容に\d+件の誤りがあります/ });
        await expect(summaryHeading).toBeVisible();
        await expect(summaryHeading).toBeFocused();

        const title = page.getByLabel(/^件名/);
        await expect(title).toHaveAttribute("aria-invalid", "true");
        await expectNoAxeViolations(page, "作成フォーム（エラー）");

        // エラー一覧のリンクで該当項目へ移動できる
        await page.getByRole("link", { name: /^メールアドレス：/ }).click();
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
        await page.getByRole("checkbox", { name: "記載内容に誤りがないことを確かめた" }).check();
        await page.getByRole("button", { name: "確認へ進む" }).click();

        await expect(page.getByRole("heading", { name: /確認/ }).first()).toBeVisible();
        await expect(page.getByText("商店街活性化事業補助金の申請")).toBeVisible();
        await expectNoAxeViolations(page, "作成フォーム（確認）");

        await page.getByRole("button", { name: "申請する" }).click();
        await expect(page.getByRole("heading", { name: /申請の受付完了|完了/ }).first()).toBeVisible();
        await expectNoAxeViolations(page, "作成フォーム（完了）");
    });
});

test("開いた状態の部品（メニュー、ダイアログ、エラー表示）も上下中央でそろっている", async ({ page }) => {
    await page.goto("/applications");
    await waitForLoaded(page);
    await page.getByRole("button", { name: /の操作$/ }).first().click();
    expect(await findMisalignments(page), "行の操作メニュー").toEqual([]);
    await page.keyboard.press("Escape");

    await page.getByRole("checkbox").nth(1).check();
    expect(await findMisalignments(page), "一括操作").toEqual([]);

    await page.goto("/applications/new");
    await page.getByRole("button", { name: "確認へ進む" }).click();
    expect(await findMisalignments(page), "フォームのエラー").toEqual([]);
});

/** Tab を押して、target にフォーカスが来るまで進む（マウスを使わずに操作できることの確認）。 */
async function tabTo(page: Page, target: Locator, max = 60) {
    for (let i = 0; i < max; i++) {
        await page.keyboard.press("Tab");
        if (await target.evaluate((el) => el === document.activeElement)) return;
    }
    throw new Error(`Tabで${target}まで移動できなかった`);
}

test("キーボードだけで新規申請を完了できる", async ({ page }) => {
    await open(page, "/applications/new");

    await tabTo(page, page.getByLabel(/^件名/));
    await page.keyboard.type("公園使用許可の申請");
    await tabTo(page, page.getByRole("radio", { name: "補助金" }));
    // ラジオボタンは矢印キーで選ぶ（補助金 → 許認可）
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("radio", { name: "許認可" })).toBeChecked();
    await tabTo(page, page.getByLabel(/^申請額/));
    await page.keyboard.type("50000");
    await tabTo(page, page.getByLabel(/^氏名/));
    await page.keyboard.type("山田 太郎");
    await tabTo(page, page.getByLabel(/^メールアドレス/));
    await page.keyboard.type("yamada@example.jp");
    await tabTo(page, page.getByLabel(/^希望日/));
    await page.keyboard.type("2099/12/01");

    await tabTo(page, page.getByRole("button", { name: "ファイルを選択" }));
    // ファイルの選択はネイティブの <input type="file">。Space で開く（ブラウザの標準の動き）
    const chooser = page.waitForEvent("filechooser");
    await page.keyboard.press("Space");
    await (await chooser).setFiles({ name: "申請書.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4") });

    await tabTo(page, page.getByRole("checkbox", { name: "記載内容に誤りがないことを確かめた" }));
    await page.keyboard.press("Space");
    await tabTo(page, page.getByRole("button", { name: "確認へ進む" }));
    await page.keyboard.press("Enter");

    await expect(page.getByRole("heading", { level: 2, name: "入力内容の確認" })).toBeFocused();
    await tabTo(page, page.getByRole("button", { name: "申請する" }));
    await page.keyboard.press("Enter");
    await expect(page.getByText("申請の受付完了")).toBeFocused();
});
