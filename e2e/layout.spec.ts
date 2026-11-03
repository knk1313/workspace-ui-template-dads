import { expect, test } from "@playwright/test";
import { waitForLoaded } from "./helpers";
import { PAGES } from "./routes";
import { findMisalignments, findObscuredFocus } from "./layout";

// 見た目の崩れを数値で検出する（スクリーンショットの比較では見落としやすい 1〜3px のずれ、固定ヘッダーとの重なり）。

const PATHS = PAGES.map((p) => p.path);

for (const path of PATHS) {
    test(`${path}: アイコンや部品が隣の文字の1行目と上下中央でそろっている`, async ({ page }) => {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        // 読み込み中の表示が終わるのを待つ
        await waitForLoaded(page);
        expect(await findMisalignments(page)).toEqual([]);
    });
}

for (const path of PATHS) {
    test(`${path}: Tabで移動したフォーカスが固定ヘッダーの下に隠れない`, async ({ page }) => {
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
