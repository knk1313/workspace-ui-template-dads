import type { Page } from "@playwright/test";

// 見た目の崩れを数値で検出するための計測（ブラウザ内で実行する）。

export type Misalignment = { diff: number; text: string; element: string };

/**
 * 文字の横に並んだ部品（アイコン、チェックボックス、ラジオボタン、スイッチ）の上下中央が、隣の文字の 1 行目の中央からずれている箇所を返す。
 * 1px 未満は小数点以下の丸めなので無視する。8px を超える差は「別の行にある」とみなして対象外にする（折り返した並びなど）。
 */
export async function findMisalignments(page: Page): Promise<Misalignment[]> {
    return page.evaluate(() => {
        const visible = (el: Element) => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return false;
            if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
            // 読み上げ専用（sr-only）の要素は見た目に関係しない
            const style = getComputedStyle(el);
            return !(style.position === "absolute" && r.width <= 1 && r.height <= 1);
        };
        // 要素の中で最初に見えている文字 1 文字の矩形
        const firstChar = (root: Element): DOMRect | null => {
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
                acceptNode: (n) => (n.textContent?.trim() && n.parentElement && visible(n.parentElement) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP),
            });
            const node = walker.nextNode() as Text | null;
            if (!node) return null;
            const offset = node.textContent!.search(/\S/);
            const range = document.createRange();
            range.setStart(node, offset);
            range.setEnd(node, offset + 1);
            const rect = range.getBoundingClientRect();
            return rect.width > 0 ? rect : null;
        };
        const results: { diff: number; text: string; element: string }[] = [];
        const targets = document.querySelectorAll("svg, input[type=checkbox], input[type=radio], [role=switch]");
        for (const target of targets) {
            if (!visible(target) || target.closest(".recharts-wrapper")) continue;
            if (target.tagName === "svg" && target.parentElement?.closest("svg")) continue;
            // 横並びの flex の祖先（4 段まで）で、文字を含む兄弟を探す
            let child: Element = target;
            let container = target.parentElement;
            let sibling: Element | null = null;
            for (let depth = 0; depth < 4 && container; depth++) {
                const style = getComputedStyle(container);
                if (style.display.includes("flex") && !style.flexDirection.startsWith("column")) {
                    sibling = [...container.children].find((c) => c !== child && c.textContent?.trim() && visible(c)) ?? null;
                    if (sibling) break;
                }
                child = container;
                container = container.parentElement;
            }
            if (!sibling) continue;
            const char = firstChar(sibling);
            if (!char) continue;
            const box = target.getBoundingClientRect();
            const diff = box.top + box.height / 2 - (char.top + char.height / 2);
            if (Math.abs(diff) >= 1 && Math.abs(diff) <= 8) {
                const icon = [...target.classList].find((c) => c.startsWith("lucide-"));
                results.push({ diff: Math.round(diff * 10) / 10, text: sibling.textContent!.trim().slice(0, 20), element: icon ?? target.tagName.toLowerCase() });
            }
        }
        return results;
    });
}

/**
 * Tab / Shift+Tab でフォーカスを移しながら、フォーカスした要素が固定ヘッダーなどの下に完全に隠れていないかを調べる（WCAG 2.4.11）。
 * 隠れていた要素の説明を返す。
 */
export async function findObscuredFocus(page: Page, steps: number, key: "Tab" | "Shift+Tab" = "Tab"): Promise<string[]> {
    const obscured: string[] = [];
    for (let i = 0; i < steps; i++) {
        await page.keyboard.press(key);
        const result = await page.evaluate(() => {
            const el = document.activeElement as HTMLElement | null;
            if (!el || el === document.body) return null;
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return null;
            // 要素の中の数点のどれか 1 つでも見えていれば「完全には隠れていない」
            const points = [
                [r.left + r.width / 2, r.top + r.height / 2],
                [r.left + 2, r.top + 2],
                [r.right - 2, r.bottom - 2],
            ];
            const visibleSomewhere = points.some(([x, y]) => {
                if (y < 0 || y >= innerHeight || x < 0 || x >= innerWidth) return false;
                const hit = document.elementFromPoint(x, y);
                return !!hit && (el === hit || el.contains(hit) || hit.contains(el));
            });
            return visibleSomewhere ? null : `${el.tagName.toLowerCase()}「${(el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 20)}」`;
        });
        if (result) obscured.push(result);
    }
    return obscured;
}

/**
 * Tab でフォーカスを移しながら、フォーカスの枠（outline と outline-offset の分、要素の外側にはみ出す）が、
 * スクロールの領域（overflow が visible 以外の祖先）で切り取られていないかを調べる。
 * 要素そのものは領域の中にあるのに、枠だけが領域の端で切れている場合を返す（スクロールで隠れている要素は対象外）。
 */
export async function findClippedFocusRings(page: Page, steps: number): Promise<string[]> {
    const clipped = new Set<string>();
    for (let i = 0; i < steps; i++) {
        await page.keyboard.press("Tab");
        const result = await page.evaluate(() => {
            const el = document.activeElement as HTMLElement | null;
            if (!el || el === document.body) return null;
            const cs = getComputedStyle(el);
            const ext = cs.outlineStyle === "none" ? 0 : (parseFloat(cs.outlineWidth) || 0) + (parseFloat(cs.outlineOffset) || 0);
            if (ext <= 0) return null;
            const r = el.getBoundingClientRect();
            for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
                const s = getComputedStyle(a);
                if (s.overflowX === "visible" && s.overflowY === "visible") continue;
                const ar = a.getBoundingClientRect();
                const box = {
                    l: ar.left + parseFloat(s.borderLeftWidth),
                    r: ar.right - parseFloat(s.borderRightWidth),
                    t: ar.top + parseFloat(s.borderTopWidth),
                    b: ar.bottom - parseFloat(s.borderBottomWidth),
                };
                const sides = [
                    r.left - ext < box.l - 0.5 && r.left >= box.l - 0.5 ? "左" : "",
                    r.right + ext > box.r + 0.5 && r.right <= box.r + 0.5 ? "右" : "",
                    r.top - ext < box.t - 0.5 && r.top >= box.t - 0.5 ? "上" : "",
                    r.bottom + ext > box.b + 0.5 && r.bottom <= box.b + 0.5 ? "下" : "",
                ].join("");
                if (sides) return `${el.tagName.toLowerCase()}「${(el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 20)}」の${sides}`;
            }
            return null;
        });
        if (result) clipped.add(result);
    }
    return [...clipped];
}
