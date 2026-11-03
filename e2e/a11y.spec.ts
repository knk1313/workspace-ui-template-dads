import { expect, test, type Page } from "@playwright/test";
import { expectNoHorizontalOverflow, isMobile, waitForLoaded } from "./helpers";
import { PAGES } from "./routes";

// axe では見つけにくいアクセシビリティの検査。
//   - 400% 拡大（320px 幅）でのリフロー（WCAG 1.4.10）
//   - 文字間隔を広げたときに文字が切れない（WCAG 1.4.12）
//   - 見出しの構造とランドマーク（スクリーンリーダーでの移動の手がかり）
//   - 強制カラーモード（Windows のハイコントラストなど）で状態が見分けられる
// スクリーンリーダーでの実際の読み上げは自動化できないため、docs/accessibility.md の手順で人が確かめる。

const PATHS = PAGES.map((p) => p.path);

async function open(page: Page, path: string) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await waitForLoaded(page);
}

test.describe("400%拡大（320px幅）", () => {
    test.use({ viewport: { width: 320, height: 256 } });
    for (const path of PATHS) {
        test(`${path}が横にはみ出さない`, async ({ page }) => {
            await open(page, path);
            await expectNoHorizontalOverflow(page);
        });
    }
});

/** はみ出しを隠している要素のうち、中の文字が切れているもの（読み上げ専用の要素は除く）。 */
async function findClippedText(page: Page): Promise<string[]> {
    return page.evaluate(() =>
        [...document.querySelectorAll("body *")]
            .filter((el) => {
                if (!el.textContent?.trim() || !el.checkVisibility()) return false;
                const style = getComputedStyle(el);
                if (style.clipPath !== "none" || style.clip !== "auto") return false; // sr-only
                const clips = ["hidden", "clip"].includes(style.overflowX) || ["hidden", "clip"].includes(style.overflowY);
                return clips && (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1);
            })
            .map((el) => `${el.tagName.toLowerCase()}「${el.textContent!.trim().slice(0, 20)}」`),
    );
}

for (const path of PATHS) {
    test(`${path}: 文字間隔を広げても文字が切れない`, async ({ page }) => {
        await open(page, path);
        // WCAG 1.4.12 の値: 行の高さ 1.5、段落の後 2 倍、文字の間隔 0.12 倍、単語の間隔 0.16 倍
        await page.addStyleTag({
            content: "* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }",
        });
        expect(await findClippedText(page)).toEqual([]);
        await expectNoHorizontalOverflow(page);
    });
}

for (const path of PATHS) {
    test(`${path}: h1が1つで、見出しのレベルが飛ばず、mainが1つある`, async ({ page }) => {
        await open(page, path);
        const levels = await page.evaluate(() =>
            [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].filter((h) => h.checkVisibility()).map((h) => Number(h.tagName[1])),
        );
        expect(levels.filter((l) => l === 1), "h1の数").toHaveLength(1);
        const skipped = levels.flatMap((level, i) => (i > 0 && level > levels[i - 1] + 1 ? [`h${levels[i - 1]} → h${level}`] : []));
        expect(skipped, "見出しのレベルが飛んでいる箇所").toEqual([]);
        await expect(page.getByRole("main")).toHaveCount(1);
    });
}

test.describe("強制カラーモード", () => {
    test.beforeEach(async ({ page }) => {
        await page.emulateMedia({ forcedColors: "active" });
    });

    test("スイッチのオン・オフで見た目が変わる", async ({ page }) => {
        await open(page, "/settings?tab=notifications");
        const track = (name: string) =>
            page.getByRole("switch", { name }).evaluate((el) => getComputedStyle(el.firstElementChild!).backgroundColor);
        // 初期値: 「申請が届いたとき」はオン、「週次のまとめ」はオフ
        expect(await track("申請が届いたとき")).not.toBe(await track("週次のまとめ"));
    });

    test("チェックボックス・ラジオボタンはOSの標準の部品で描き、選択状態が分かる", async ({ page }) => {
        await open(page, "/settings?tab=notifications");
        expect(await page.getByRole("checkbox", { name: "メール" }).evaluate((e) => getComputedStyle(e).appearance)).toBe("auto");
        await open(page, "/settings?tab=display");
        expect(await page.getByRole("radio", { name: /サイドバー型/ }).evaluate((e) => getComputedStyle(e).appearance)).toBe("auto");
    });

    test("選んでいないタブに下線が出ない", async ({ page }) => {
        await open(page, "/settings");
        const style = (name: string) => page.getByRole("tab", { name }).evaluate((el) => getComputedStyle(el).borderBottomStyle);
        expect(await style("アカウント")).toBe("solid");
        expect(await style("通知")).toBe("none");
    });

    test("ナビゲーションの現在地に印が出る", async ({ page }) => {
        test.skip(isMobile(page), "サイドバーはデスクトップ幅だけ");
        await open(page, "/settings");
        const marker = await page
            .getByRole("navigation", { name: "メインナビゲーション" })
            .getByRole("link", { name: "設定" })
            .evaluate((el) => getComputedStyle(el, "::before").backgroundColor);
        expect(marker).not.toBe("rgba(0, 0, 0, 0)");
    });
});
