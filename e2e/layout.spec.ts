import { expect, test } from "@playwright/test";
import { waitForLoaded } from "./helpers";
import { findMisalignments, findObscuredFocus } from "./layout";

// 見た目の崩れを数値で検出する（スクリーンショットの比較では見落としやすい 1〜3px のずれ、固定ヘッダーとの重なり）。

const PAGES = ["/", "/applications", "/applications/app-001", "/applications/new", "/settings", "/settings?tab=notifications", "/settings?tab=display", "/login", "/no-such-page"];

for (const path of PAGES) {
    test(`${path}: アイコンや部品が隣の文字の 1 行目と上下中央でそろっている`, async ({ page }) => {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        // 読み込み中の表示が終わるのを待つ
        await waitForLoaded(page);
        expect(await findMisalignments(page)).toEqual([]);
    });
}

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

for (const path of ["/", "/applications", "/applications/new", "/settings"]) {
    test(`${path}: Tab で移動したフォーカスが固定ヘッダーの下に隠れない`, async ({ page }) => {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        expect(await findObscuredFocus(page, 40, "Tab"), "Tab").toEqual([]);
        // ページの末尾から戻るとき（上方向へのスクロール）に隠れやすい
        await page.evaluate(() => {
            (document.activeElement as HTMLElement | null)?.blur();
            window.scrollTo(0, document.documentElement.scrollHeight);
        });
        expect(await findObscuredFocus(page, 40, "Shift+Tab"), "Shift+Tab").toEqual([]);
    });
}
