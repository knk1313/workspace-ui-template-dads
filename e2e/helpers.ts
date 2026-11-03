import { expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// axe（WCAG 2.2 AA 相当のタグ + ベストプラクティス）で違反がないことを確認する。色のコントラストも実ブラウザで検査される。
export async function expectNoAxeViolations(page: Page, context?: string): Promise<void> {
    // 固定ヘッダーの下に一時的にもぐった要素を target-size の「隠れている」と誤判定させないため、先頭に戻してから検査する。
    await page.evaluate(() => window.scrollTo(0, 0));
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]).analyze();
    const summary = results.violations
        .map((v) => `${v.id} (${v.impact}) ${v.help}\n  ${v.nodes.map((n) => `${n.target.join(" ")}  ${n.failureSummary?.split("\n")[1] ?? ""}`).join("\n  ")}`)
        .join("\n\n");
    expect(results.violations, `${context ?? page.url()}\n${summary}`).toEqual([]);
}

/** ページ全体で横スクロールが発生していないこと（モバイル幅のリフロー確認）。 */
export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, "ページ全体が横にはみ出している").toBeLessThanOrEqual(0);
}

export function isMobile(page: Page): boolean {
    return (page.viewportSize()?.width ?? 1280) < 1024;
}

/** モバイルではハンバーガーからドロワーを開いてリンクを押す。デスクトップではサイドバーのリンクを押す。 */
export async function navigateVia(page: Page, label: string): Promise<void> {
    if (isMobile(page)) {
        await page.getByRole("button", { name: "メニュー", exact: true }).click();
        await page.getByRole("dialog", { name: "メニュー" }).getByRole("link", { name: label }).click();
    } else {
        await page.getByRole("navigation", { name: "メインナビゲーション" }).getByRole("link", { name: label }).click();
    }
}
