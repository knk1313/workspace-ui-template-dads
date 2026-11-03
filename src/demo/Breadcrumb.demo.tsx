import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { ComponentDemo } from "./types";

const items = [
    { label: "ホーム", href: "/" },
    { label: "コンポーネント", href: "/components" },
    { label: "ナビゲーション", href: "/components" },
    { label: "パンくずナビゲーション" },
];

const demo: ComponentDemo = {
    slug: "breadcrumb",
    title: "パンくずナビゲーション",
    category: "ナビゲーション",
    description: "サイトの階層内での現在位置を示す。ヘッダーとページ見出しの間に置き、幅を超えたら折り返す。",
    dadsUrl: "https://design.digital.go.jp/dads/components/breadcrumb/",
    source: "@/components/ui/Breadcrumb",
    examples: [
        {
            title: "基本",
            description: "最後の項目は現在ページ（aria-current=\"page\"）のテキスト。区切りは 12px のシェブロン。",
            render: () => <Breadcrumb items={items} label="パンくずリスト（基本）" />,
        },
        {
            title: "長い階層の折り返し",
            render: () => (
                <div className="max-w-80">
                    <Breadcrumb
                        label="パンくずリスト（折り返し）"
                        items={[
                            { label: "ホーム", href: "/" },
                            { label: "行政手続き", href: "/components" },
                            { label: "住民票・戸籍に関する手続き", href: "/components" },
                            { label: "住民票の写しの交付申請（オンライン）" },
                        ]}
                    />
                </div>
            ),
        },
        {
            title: "モバイルで中間を省略",
            description: "collapseOnMobile: md 未満では先頭と末尾だけを表示し、「…」ボタンで全体を表示する。画面幅を狭めて確認する。",
            render: () => <Breadcrumb items={items} collapseOnMobile label="パンくずリスト（省略）" />,
        },
    ],
};

export default demo;
