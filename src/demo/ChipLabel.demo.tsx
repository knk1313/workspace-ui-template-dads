import { AlertTriangle, CheckCircle2, Clock, Info } from "lucide-react";
import { ChipLabel, StatusChip, type ChipLabelColor, type ChipLabelStyle } from "@/components/ui/ChipLabel";
import type { ComponentDemo } from "./types";

const COLORS: ChipLabelColor[] = ["gray", "blue", "light-blue", "cyan", "green", "lime", "yellow", "orange", "red", "magenta", "purple"];
const STYLES: ChipLabelStyle[] = ["text", "outlined", "filled-1", "filled-2"];

const demo: ComponentDemo = {
    slug: "chip-label",
    title: "チップラベル",
    category: "データ表示",
    description: "状態や分類を示すキーワード（受付中 / 審査中 / 完了など）。色だけで意味を伝えず、必ずテキストで書く。色数は絞る。",
    dadsUrl: "https://design.digital.go.jp/dads/components/chip-label/",
    source: "@/components/ui/ChipLabel",
    examples: [
        {
            title: "StatusChip（意味に応じた色）",
            description: "success → 緑、error → 赤、warning → 黄、info → 青、neutral → グレー。画面ごとに色が揺れないようこちらを使う。",
            render: () => (
                <div className="flex flex-wrap items-center gap-2">
                    <StatusChip status="info">受付</StatusChip>
                    <StatusChip status="warning">審査中</StatusChip>
                    <StatusChip status="success">完了</StatusChip>
                    <StatusChip status="error">差戻し</StatusChip>
                    <StatusChip status="neutral">下書き</StatusChip>
                </div>
            ),
        },
        {
            title: "アイコン付き",
            description: "リードアイコン（24px）は装飾。filled-1 では非テキスト色になる。",
            render: () => (
                <div className="flex flex-wrap items-center gap-2">
                    <StatusChip status="info" icon={Info}>
                        新着
                    </StatusChip>
                    <StatusChip status="warning" icon={Clock}>
                        期限間近
                    </StatusChip>
                    <StatusChip status="success" icon={CheckCircle2}>
                        承認済み
                    </StatusChip>
                    <StatusChip status="error" icon={AlertTriangle}>
                        要対応
                    </StatusChip>
                </div>
            ),
        },
        {
            title: "スタイル × 色（全組み合わせ）",
            description: "text / outlined / filled-1（薄い背景 + 枠）/ filled-2（塗り）。色は DADS のプリミティブで規定された 11 色相。",
            render: () => (
                <div className="flex flex-col gap-3">
                    {STYLES.map((style) => (
                        <div key={style} className="flex flex-wrap items-center gap-2">
                            <span className="w-20 text-14 text-text-muted">{style}</span>
                            {COLORS.map((color) => (
                                <ChipLabel key={color} style={style} color={color}>
                                    {color}
                                </ChipLabel>
                            ))}
                        </div>
                    ))}
                </div>
            ),
        },
    ],
};

export default demo;
