import type { ReactNode } from "react";

// コンポーネントのデモ定義。src/demo/*.demo.tsx が default export し、registry.ts が import.meta.glob で集める。
export type DemoExample = {
    title: string;
    description?: string;
    render: () => ReactNode;
};

export type DemoCategory = "レイアウト" | "ナビゲーション" | "フォーム" | "データ表示" | "グラフ" | "フィードバック" | "要素";

export type ComponentDemo = {
    /** URL のパス（/components/:slug）。 */
    slug: string;
    title: string;
    category: DemoCategory;
    description: string;
    /** 対応する DADS コンポーネントのページ。DADS にない場合は省略。 */
    dadsUrl?: string;
    /** import 元（README の一覧に使う）。 */
    source: string;
    examples: DemoExample[];
};
