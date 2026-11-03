import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// コンポーネントのデモページを 1 つずつ開き、axe（WCAG 2.2 AA 相当のタグ）で違反がないことを確認する。
// デモ一覧は /components のリンクから動的に取得するので、デモを追加すると自動で対象になる。

test.describe("コンポーネントのデモ", () => {
    test("一覧からすべてのデモに到達でき、axe の違反がない", async ({ page }, testInfo) => {
        test.setTimeout(240000);
        await page.goto("/components");
        await expect(page.getByRole("heading", { level: 1, name: "コンポーネント" })).toBeVisible();

        const hrefs = await page.locator("main a[href^='/components/']").evaluateAll((els) => els.map((a) => a.getAttribute("href")!));
        expect(hrefs.length).toBeGreaterThan(30);

        const failures: string[] = [];
        for (const href of hrefs) {
            await page.goto(href);
            await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
            const results = await new AxeBuilder({ page })
                .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
                // デモページでは同じ見出しを複数回使う例があるため、見出し順序のベストプラクティスだけ除外する。
                .disableRules(["heading-order"])
                .analyze();
            for (const v of results.violations) {
                failures.push(`${href}: ${v.id} (${v.impact}) ${v.help}\n  ${v.nodes.map((n) => n.html).join("\n  ")}`);
            }
        }
        await testInfo.attach("axe-failures", { body: failures.join("\n\n") || "なし", contentType: "text/plain" });
        expect(failures, failures.join("\n\n")).toEqual([]);
    });
});
