import { Blocks, FileText, LayoutDashboard, Settings } from "lucide-react";
import { SideNav, type SideNavSection } from "@/components/ui/SideNav";
import type { ComponentDemo } from "./types";

const sections: SideNavSection[] = [
    { title: "ナビゲーション", items: [{ label: "ダッシュボード", href: "/", icon: LayoutDashboard }] },
    {
        title: "ワークスペース",
        items: [
            {
                label: "コンポーネント",
                href: "/components",
                icon: Blocks,
                children: [
                    { label: "一覧", href: "/components", end: true },
                    { label: "サイドナビゲーション", href: "/components/side-nav" },
                ],
            },
            { label: "ドキュメント", href: "/documents", icon: FileText },
        ],
    },
    { title: "管理", items: [{ label: "設定", href: "/settings", icon: Settings }] },
];

const demo: ComponentDemo = {
    slug: "side-nav",
    title: "サイドナビゲーション",
    category: "ナビゲーション",
    description: "サイドバー型レイアウトの階層付きメニュー。現在地は背景・太字・左の縦棒と aria-current=\"page\" で示す。子項目は開閉ボタンで開閉する。",
    source: "@/components/ui/SideNav",
    examples: [
        {
            title: "階層付き",
            description: "現在のページ（このデモ）を含む「コンポーネント」は初期展開される。",
            render: () => (
                <div className="w-sidebar rounded-8 border border-border bg-surface">
                    <SideNav sections={sections} label="サイドナビゲーション（デモ）" />
                </div>
            ),
        },
        {
            title: "折りたたみ",
            description: "アイコンだけを表示し、ラベルは title とスクリーンリーダー用テキストで残す。",
            render: () => (
                <div className="w-sidebar-collapsed rounded-8 border border-border bg-surface">
                    <SideNav sections={sections} collapsed label="サイドナビゲーション（折りたたみデモ）" />
                </div>
            ),
        },
    ],
};

export default demo;
