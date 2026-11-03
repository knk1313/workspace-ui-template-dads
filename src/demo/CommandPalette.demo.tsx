import { useState } from "react";
import { Blocks, FileText, LayoutDashboard, Plus, Search, Settings } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";
import { CommandPalette, useCommandPaletteShortcut, type CommandItem } from "@/components/ui/CommandPalette";
import type { ComponentDemo } from "./types";

function CommandPaletteExample() {
    const [open, setOpen] = useState(false);
    const [last, setLast] = useState<string>();
    const navigate = useNavigate();
    useCommandPaletteShortcut(() => setOpen(true));

    const items: CommandItem[] = [
        { id: "dashboard", label: "ダッシュボード", group: "ページ", icon: LayoutDashboard, keywords: ["home", "ホーム"], onSelect: () => navigate("/") },
        { id: "documents", label: "ドキュメント", group: "ページ", icon: FileText, keywords: ["documents"], onSelect: () => navigate("/documents") },
        { id: "components", label: "コンポーネント", group: "ページ", icon: Blocks, onSelect: () => navigate("/components") },
        { id: "settings", label: "設定", group: "ページ", icon: Settings, keywords: ["settings"], onSelect: () => navigate("/settings") },
        { id: "new", label: "ドキュメントを新規作成", group: "操作", icon: Plus, onSelect: () => setLast("ドキュメントを新規作成") },
    ];

    return (
        <div className="flex flex-col items-start gap-2">
            <Button variant="outline" leadIcon={Search} onClick={() => setOpen(true)}>
                検索（Ctrl+K）
            </Button>
            {last && <p className="m-0 text-text-muted">実行した操作: {last}</p>}
            <CommandPalette open={open} onClose={() => setOpen(false)} items={items} />
        </div>
    );
}

const demo: ComponentDemo = {
    slug: "command-palette",
    title: "コマンドパレット",
    category: "ナビゲーション",
    description: "ページやコマンドを検索して実行するダイアログ。APG の Dialog + Combobox パターン。↑↓ で選択、Enter で実行、Esc で閉じる。Ctrl+K / Cmd+K で開く。",
    source: "@/components/ui/CommandPalette",
    examples: [
        {
            title: "基本",
            description: "「ページ」を選ぶと移動する。「操作」はこのページで実行結果を表示する。",
            render: () => <CommandPaletteExample />,
        },
    ],
};

export default demo;
