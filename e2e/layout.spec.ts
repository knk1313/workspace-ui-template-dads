import { expect, test } from "@playwright/test";
import { isMobile, waitForLoaded } from "./helpers";
import { PAGES } from "./routes";
import { findClippedFocusRings, findMisalignments, findObscuredFocus } from "./layout";

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
        // 操作の途中で中身が届くと、フォーカスした要素の位置がずれ、測るたびに結果が変わる
        await waitForLoaded(page);
        expect(await findObscuredFocus(page, 40, "Tab"), "Tab").toEqual([]);
        // ページの末尾から戻るとき（上方向へのスクロール）に隠れやすい
        await page.evaluate(() => {
            (document.activeElement as HTMLElement | null)?.blur();
            window.scrollTo(0, document.documentElement.scrollHeight);
        });
        expect(await findObscuredFocus(page, 40, "Shift+Tab"), "Shift+Tab").toEqual([]);
    });
}

for (const path of PATHS) {
    test(`${path}: フォーカスの枠が、横スクロールの領域などで切れない`, async ({ page }) => {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await waitForLoaded(page);
        expect(await findClippedFocusRings(page, 40)).toEqual([]);
    });
}

test("表の横スクロールの端にある要素へTabで移っても、フォーカスの枠が切れない", async ({ page }) => {
    // 文字の幅によって、要素が見えている範囲のちょうど端に来ることがある。その位置をわざと作って確かめる。
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/applications");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await waitForLoaded(page);
    const count = await page.locator("thead button").count();
    for (let i = 1; i < count; i++) {
        await page.evaluate((i) => {
            const buttons = document.querySelectorAll<HTMLButtonElement>("thead button");
            const region = buttons[i].closest<HTMLElement>(".overflow-x-auto")!;
            region.scrollLeft = 0;
            // 次のボタンの右端が、見えている範囲の 2px 内側に来るようにスクロールしておく
            region.scrollLeft = buttons[i].getBoundingClientRect().right - region.getBoundingClientRect().right + 2;
            buttons[i - 1].focus({ preventScroll: true });
        }, i);
        await page.keyboard.press("Tab");
        await expect
            .poll(() =>
                page.evaluate(() => {
                    const el = document.activeElement!;
                    const region = el.closest(".overflow-x-auto")!;
                    return region.getBoundingClientRect().right - el.getBoundingClientRect().right;
                }),
            )
            .toBeGreaterThanOrEqual(6);
    }
});

test("サイドバーを開閉する途中で、ラベルが折り返されない", async ({ page }) => {
    test.skip(isMobile(page), "サイドバーが出るPC幅だけ");
    await page.goto("/settings");
    await waitForLoaded(page);
    const nav = page.getByRole("navigation", { name: "メインナビゲーション" });
    await expect(nav).toBeVisible();
    const normal = await nav.getByRole("link").evaluateAll((els) => Math.max(...els.map((el) => el.getBoundingClientRect().height)));

    for (const name of ["サイドバーを折りたたむ", "サイドバーを広げる"]) {
        // 押してからアニメーションが終わるまで、フレームごとに項目の高さ（折り返すと高くなる）とサイドバーの幅を測る
        const frames = await page.getByRole("button", { name }).evaluate(async (button) => {
            const aside = button.closest("aside")!;
            const frames: { width: number; height: number }[] = [];
            (button as HTMLElement).click();
            const start = performance.now();
            while (performance.now() - start < 500) {
                await new Promise((resolve) => requestAnimationFrame(resolve));
                const heights = Array.from(aside.querySelectorAll("nav a"), (el) => el.getBoundingClientRect().height);
                frames.push({ width: aside.parentElement!.getBoundingClientRect().width, height: Math.max(...heights) });
            }
            return frames;
        });
        // 幅が変わる途中を測れていること（測れていなければ、この検査は意味がない）
        expect(new Set(frames.map((f) => Math.round(f.width))).size).toBeGreaterThan(2);
        expect(Math.max(...frames.map((f) => f.height))).toBeLessThanOrEqual(normal);
    }
});
