import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { BREAKPOINTS } from "./breakpoints";

// ローカルデザインシステム（local.css）で値を差し替えても、DADS の要件を外れていないかを検査する。
// 色のコントラストは contrast.test.ts で検査する。ここでは色以外の要件を見る。
// 要件の出典: DADS「基本デザインの編集」https://design.digital.go.jp/dads/guidance/local-design-system/

const here = dirname(fileURLToPath(import.meta.url));
const read = (f: string) => readFileSync(join(here, f), "utf8");

function collect(files: string[]): Map<string, string> {
    const map = new Map<string, string>();
    for (const css of files.map(read)) {
        for (const m of css.matchAll(/^\s*(--[a-z0-9-]+):\s*([^;]+);/gim)) map.set(m[1], m[2].trim());
    }
    return map;
}

const LOCAL_CSS = read("local.css");
const TOKENS = collect(["primitives.css", "theme.css", "local.css"]);

function resolve(name: string, depth = 0): string {
    const v = TOKENS.get(name);
    if (!v) throw new Error(`トークンが見つかりません: ${name}`);
    if (depth > 10) throw new Error(`参照が深すぎます: ${name}`);
    const ref = v.match(/^var\((--[a-z0-9-]+)\)$/);
    return ref ? resolve(ref[1], depth + 1) : v;
}

/** rem / px / 単位なしの値を px にする（1rem = 16px）。 */
function toPx(value: string): number {
    const m = value.match(/^(-?\d*\.?\d+)(rem|px)?$/);
    if (!m) throw new Error(`寸法として読めません: ${value}`);
    return Number(m[1]) * (m[2] === "rem" ? 16 : 1);
}

/** local.css に書いた、ある名前空間のトークンの名前（例: --radius-button）。 */
function localNames(prefix: string): string[] {
    return [...LOCAL_CSS.matchAll(new RegExp(`^\\s*(${prefix}[a-z0-9-]+):`, "gm"))].map((m) => m[1]);
}

/** 影の役割のトークンが指す高さレベル（--shadow-3 なら 3）。 */
function elevation(name: string): number {
    const ref = TOKENS.get(name)?.match(/^var\(--shadow-(\d)\)$/);
    if (!ref) throw new Error(`${name} は primitives.css の --shadow-1〜8 から選んでください`);
    return Number(ref[1]);
}

describe("ローカルデザインシステム: カラー", () => {
    it("キーカラーは 50〜1200 の 13 段がそろっている", () => {
        const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200];
        for (const s of steps) expect(() => resolve(`--color-key-${s}`), `--color-key-${s}`).not.toThrow();
    });

    it("フォーカスの色は DADS の既定（黒と Yellow-300）から変えていない", () => {
        expect(resolve("--color-focus")).toBe("#000000");
        expect(resolve("--color-focus-ring")).toBe("#ffd43d");
    });
});

describe("ローカルデザインシステム: タイポグラフィ", () => {
    it("本文の文字の大きさは 16px 以上", () => {
        expect(toPx(resolve("--body-font-size"))).toBeGreaterThanOrEqual(16);
    });

    it("本文の行の高さは文字の大きさの 1.5 倍以上", () => {
        expect(Number(resolve("--leading-body"))).toBeGreaterThanOrEqual(1.5);
    });

    it("文字サイズのトークンとテキストスタイルに 14px 未満がない", () => {
        const sizes = [...TOKENS].filter(([k]) => /^--text-\d+$/.test(k)).map(([, v]) => v);
        sizes.push(...[...read("typography.css").matchAll(/font-size:\s*([^;]+);/g)].map((m) => m[1].trim()));
        expect(sizes.length).toBeGreaterThan(0);
        for (const s of sizes) expect(toPx(s), s).toBeGreaterThanOrEqual(14);
    });
});

describe("ローカルデザインシステム: 余白", () => {
    it("余白の 1 段は 4px のまま（操作部品の高さに効くため）", () => {
        expect(toPx(resolve("--spacing"))).toBe(4);
    });

    it("タップ領域は 44px 以上", () => {
        expect(toPx(resolve("--spacing-target"))).toBeGreaterThanOrEqual(44);
    });

    it.each(localNames("--spacing-page-"))("%s は 8px の倍数", (name) => {
        expect(toPx(resolve(name)) % 8).toBe(0);
    });
});

describe("ローカルデザインシステム: 角の形状", () => {
    it.each(localNames("--radius-"))("%s は 0 以上の寸法", (name) => {
        expect(toPx(resolve(name))).toBeGreaterThanOrEqual(0);
    });
});

describe("ローカルデザインシステム: ドロップシャドウとエレベーション", () => {
    it.each(localNames("--shadow-"))("%s は高さレベル 1〜8 のどれか", (name) => {
        expect(elevation(name)).toBeGreaterThanOrEqual(1);
        expect(elevation(name)).toBeLessThanOrEqual(8);
    });

    it("ダイアログは、hover で浮く要素より 2 段以上高い", () => {
        expect(elevation("--shadow-dialog") - elevation("--shadow-card-hover")).toBeGreaterThanOrEqual(2);
    });

    it("ポップアップ（メニューなど）は、下の面（高さレベル 0）より高い", () => {
        expect(elevation("--shadow-popup")).toBeGreaterThanOrEqual(1);
    });
});

describe("ローカルデザインシステム: レイアウト", () => {
    it("local.css の --breakpoint-* と breakpoints.ts の値が一致する", () => {
        const css = Object.fromEntries(localNames("--breakpoint-").map((name) => [name.replace("--breakpoint-", ""), resolve(name)]));
        expect(css).toEqual(BREAKPOINTS);
    });

    it("ブレークポイントは狭い順に並んでいる", () => {
        const widths = Object.values(BREAKPOINTS).map(toPx);
        expect(widths).toEqual([...widths].sort((a, b) => a - b));
    });
});
