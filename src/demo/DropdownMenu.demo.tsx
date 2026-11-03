import { useState } from "react";
import { Copy, Download, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, type DropdownMenuEntry } from "@/components/ui/DropdownMenu";
import type { ComponentDemo } from "./types";

function Example() {
    const [last, setLast] = useState("なし");
    const items: DropdownMenuEntry[] = [
        { label: "編集", icon: Pencil, onSelect: () => setLast("編集") },
        { label: "複製", icon: Copy, onSelect: () => setLast("複製") },
        { label: "ダウンロード", icon: Download, onSelect: () => setLast("ダウンロード") },
        { label: "公開する（権限がありません）", onSelect: () => setLast("公開"), disabled: true },
        "separator",
        { label: "削除", icon: Trash2, onSelect: () => setLast("削除"), danger: true },
    ];
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-start gap-4">
                <DropdownMenu label="操作" items={items} />
                <DropdownMenu label="操作" items={items} style="outlined" />
                <DropdownMenu label="操作" items={items} style="filled" size="sm" />
                <DropdownMenu label="書類の操作" items={items} iconOnly align="end" />
            </div>
            <p className="m-0 text-text-muted">最後に選んだ操作: {last}</p>
        </div>
    );
}

const demo: ComponentDemo = {
    slug: "dropdown-menu",
    title: "ドロップダウンメニュー",
    category: "フィードバック",
    description: "ボタンで開くアクションの一覧（DADS メニューリストボックス + APG Menu Button）。行の「その他の操作」などに使う。",
    dadsUrl: "https://design.digital.go.jp/dads/components/menu-list-box/",
    source: "@/components/ui/DropdownMenu",
    examples: [
        {
            title: "トリガーのスタイル",
            description: "text / outlined / filled、サイズ sm 36 / md 44、縦三点リーダーのアイコンのみ（aria-label 必須）。↓↑ で移動、Home / End、Enter / Space で実行、Esc で閉じる、文字入力で先頭一致。画面下端では上に開く。",
            render: () => <Example />,
        },
    ],
};

export default demo;
