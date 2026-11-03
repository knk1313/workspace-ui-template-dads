import { Bell, MoreVertical, Pencil, Trash2, X } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import type { ComponentDemo } from "./types";

const demo: ComponentDemo = {
    slug: "icon-button",
    title: "アイコンボタン",
    category: "要素",
    description: "アイコンだけのボタン。視覚的なラベルがないため label（aria-label）が必須。ターゲットは 44px を確保する。",
    source: "@/components/ui/IconButton",
    examples: [
        {
            title: "種類",
            description: "ghost（背景なし）と outline（枠線あり）。hover で控えめな面の色になる。",
            render: () => (
                <div className="flex flex-wrap items-center gap-4">
                    <IconButton icon={X} label="閉じる" />
                    <IconButton icon={Bell} label="通知" />
                    <IconButton icon={Pencil} label="編集" variant="outline" />
                    <IconButton icon={MoreVertical} label="その他の操作" variant="outline" />
                </div>
            ),
        },
        {
            title: "サイズ",
            description: "md 44px / sm 36px（sm は見えないタップ領域で 44px を確保する）。",
            render: () => (
                <div className="flex flex-wrap items-center gap-4">
                    <IconButton icon={Pencil} label="編集（md）" size="md" variant="outline" />
                    <IconButton icon={Pencil} label="編集（sm）" size="sm" variant="outline" />
                </div>
            ),
        },
        {
            title: "取り消せない操作（エラー色）",
            render: () => (
                <div className="flex flex-wrap items-center gap-4">
                    <IconButton icon={Trash2} label="削除" tone="error" />
                    <IconButton icon={Trash2} label="削除" tone="error" variant="outline" />
                </div>
            ),
        },
    ],
};

export default demo;
