import { DonutChart } from "@/components/charts/DonutChart";
import type { ComponentDemo } from "./types";

// 申請の状態別件数（ダミー）。
const byStatus = [
    { name: "承認済み", value: 1210 },
    { name: "審査中", value: 320 },
    { name: "差し戻し", value: 97 },
];

// 申請種別（7 種類 → 5 枠にまとめる例）。
const byType = [
    { name: "住所変更", value: 820 },
    { name: "氏名変更", value: 410 },
    { name: "再交付", value: 365 },
    { name: "新規登録", value: 290 },
    { name: "廃止", value: 140 },
    { name: "代理人変更", value: 85 },
    { name: "訂正", value: 40 },
];

const demo: ComponentDemo = {
    slug: "donut-chart",
    title: "ドーナツグラフ",
    category: "グラフ",
    description:
        "構成比を見せる。総量が明らかで、コンパクトに伝えたい場合だけ使う。多くの場合は棒グラフの方が正確に比較できる（ガイドブック）。中央に合計、各扇に名前と割合を表示し、色だけに依存しない。",
    source: "@/components/charts/DonutChart",
    examples: [
        {
            title: "合計の表示",
            description: "中央に合計と単位。扇の外側に「名前 割合」のラベル。データテーブルには値と構成比を出す。",
            render: () => (
                <div className="max-w-xl">
                    <DonutChart title="申請の状態別構成比" unit="件" data={byStatus} centerLabel="申請合計" source="申請管理システム" updatedAt="2026-10-31" />
                </div>
            ),
        },
        {
            title: "「その他」へのまとめ",
            description: "扇は最大 5。maxSlices を超えた分は「その他」にまとめる（7 種類 → 4 種類 + その他）。",
            render: () => (
                <div className="max-w-xl">
                    <DonutChart title="申請種別の構成比" unit="件" data={byType} maxSlices={5} note="件数の多い順。上位 4 種別以外は「その他」" />
                </div>
            ),
        },
        {
            title: "小さい表示（ラベルなし）",
            description: "狭い場所では showLabels=false にし、凡例とデータテーブルで補う。",
            render: () => (
                <div className="max-w-sm">
                    <DonutChart title="申請の状態別構成比" unit="件" data={byStatus} height="sm" showLabels={false} innerRadius="65%" />
                </div>
            ),
        },
    ],
};

export default demo;
