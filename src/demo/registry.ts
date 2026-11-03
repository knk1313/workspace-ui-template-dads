import type { ComponentDemo, DemoCategory } from "./types";

// src/demo/*.demo.tsx を自動で集める。デモを追加するときはファイルを置くだけでよい。
const modules = import.meta.glob<{ default: ComponentDemo }>("./*.demo.tsx", { eager: true });

export const CATEGORY_ORDER: DemoCategory[] = ["要素", "レイアウト", "ナビゲーション", "フォーム", "データ表示", "グラフ", "フィードバック"];

export const demos: ComponentDemo[] = Object.values(modules)
    .map((m) => m.default)
    .sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.title.localeCompare(b.title, "ja"));

export function findDemo(slug: string): ComponentDemo | undefined {
    return demos.find((d) => d.slug === slug);
}
