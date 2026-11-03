import { expect, test } from "@playwright/test";
import { expectNoAxeViolations, expectNoHorizontalOverflow, isMobile, navigateVia } from "./helpers";
import { PAGES } from "./routes";

// 主要ページの表示・ナビゲーション・アクセシビリティ（desktop / mobile の両プロジェクトで実行する）。


for (const p of PAGES) {
    test(`${p.path}を表示でき、axeの違反がなく、横にはみ出さない`, async ({ page }) => {
        await page.goto(p.path);
        const h1 = page.getByRole("heading", { level: 1 });
        await expect(h1).toBeVisible();
        if (p.h1) await expect(h1).toHaveText(p.h1);
        await expect(page.getByRole("main")).toBeVisible();
        await expectNoHorizontalOverflow(page);
        await expectNoAxeViolations(page, p.path);
    });
}

test("長いページはマウスホイールで縦にスクロールできる", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const viewport = page.viewportSize()!;
    await page.mouse.move(viewport.width / 2, viewport.height / 2);
    await page.mouse.wheel(0, 600);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

test("ナビゲーションで各画面へ移動でき、現在地が示される", async ({ page }) => {
    await page.goto("/");
    await navigateVia(page, "設定");
    await expect(page).toHaveURL(/\/settings$/);
    if (!isMobile(page)) {
        const current = page.getByRole("navigation", { name: "メインナビゲーション" }).getByRole("link", { name: "設定" });
        await expect(current).toHaveAttribute("aria-current", "page");
    }
});

test("最初のTabで「本文へスキップ」が現れ、本文へ移動できる", async ({ page }) => {
    await page.goto("/settings");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "本文へスキップ" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
});

test("フォーカスインジケーターはDADSの黒4pxアウトラインになる", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("メールアドレス").focus();
    await page.keyboard.press("Tab");
    const outline = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const s = getComputedStyle(el);
        return { width: s.outlineWidth, style: s.outlineStyle, color: s.outlineColor };
    });
    expect(outline).toEqual({ width: "4px", style: "solid", color: "rgb(0, 0, 0)" });
});

test("モバイル幅ではハンバーガーメニューのドロワーが開閉でき、Escで閉じてボタンへ戻る", async ({ page }) => {
    test.skip(!isMobile(page), "モバイル幅だけ");
    await page.goto("/");
    const menu = page.getByRole("button", { name: "メニュー", exact: true });
    await menu.click();
    const drawer = page.getByRole("dialog", { name: "メニュー" });
    await expect(drawer).toBeVisible();
    await expectNoAxeViolations(page, "モバイルのドロワー");
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(menu).toBeFocused();
});
