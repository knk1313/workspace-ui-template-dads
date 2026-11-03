import { expect, test, type Page } from "@playwright/test";
import { expectNoAxeViolations, isMobile } from "./helpers";

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
