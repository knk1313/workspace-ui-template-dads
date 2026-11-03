import { Copy, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tooltip } from "@/components/ui/Tooltip";
import type { ComponentDemo } from "./types";

const ICON_BUTTON = "inline-flex size-target items-center justify-center rounded-8 text-text-strong hover:bg-surface-muted focus-visible:focus-ring";

const demo: ComponentDemo = {
    slug: "tooltip",
    title: "ツールチップ",
    category: "フィードバック",
    description: "ホバー・フォーカスで短い補足を表示する（APG Tooltip）。テキストは aria-describedby で常に支援技術へ渡す。DADS にないため D-11 に従って設計。",
    source: "@/components/ui/Tooltip",
    examples: [
        {
            title: "アイコンボタンの補足",
            description: "ボタンの名前は aria-label で付け、ツールチップは補足（説明）にする。Esc で消える。ツールチップにしかない情報を操作に必須にしない。",
            render: () => (
                <div className="flex flex-wrap gap-2 pt-10">
                    <Tooltip content="クリップボードにコピーします">
                        <button type="button" aria-label="コピー" className={ICON_BUTTON}>
                            <Icon icon={Copy} size="lg" />
                        </button>
                    </Tooltip>
                    <Tooltip content="CSV 形式で書き出します">
                        <button type="button" aria-label="ダウンロード" className={ICON_BUTTON}>
                            <Icon icon={Download} size="lg" />
                        </button>
                    </Tooltip>
                    <Tooltip content="ごみ箱に移動します（30 日間は復元できます）" placement="bottom">
                        <button type="button" aria-label="削除" className={ICON_BUTTON}>
                            <Icon icon={Trash2} size="lg" />
                        </button>
                    </Tooltip>
                </div>
            ),
        },
        {
            title: "ボタンに付ける",
            render: () => (
                <div className="pt-10">
                    <Tooltip content="入力内容は自動で保存されています">
                        <Button variant="outline">下書き保存</Button>
                    </Tooltip>
                </div>
            ),
        },
    ],
};

export default demo;
