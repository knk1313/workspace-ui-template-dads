import { HeaderNav } from "@/components/ui/HeaderNav";
import type { ComponentDemo } from "./types";

const demo: ComponentDemo = {
    slug: "header-nav",
    title: "水平メニュー",
    category: "ナビゲーション",
    description: "ヘッダーに置くグローバルナビゲーション。現在地は 4px の下線と aria-current=\"page\"、hover は背景と 2px の下線。lg 未満ではハンバーガーメニューに切り替える。",
    dadsUrl: "https://design.digital.go.jp/dads/components/horizontal-menu/",
    source: "@/components/ui/HeaderNav",
    examples: [
        {
            title: "基本",
            description: "「コンポーネント」が現在地（このデモのページ）。",
            render: () => (
                <div className="border-b border-border bg-surface">
                    <HeaderNav
                        label="水平メニュー（デモ）"
                        items={[
                            { label: "ダッシュボード", href: "/" },
                            { label: "ドキュメント", href: "/documents" },
                            { label: "コンポーネント", href: "/components" },
                            { label: "設定", href: "/settings" },
                        ]}
                    />
                </div>
            ),
        },
    ],
};

export default demo;
