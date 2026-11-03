import { AreaChart } from "@/components/charts/AreaChart";
import type { ComponentDemo } from "./types";

// 申請経路別の月次件数（ダミー）。
const byChannel = [
    { month: "2025-11", online: 620, counter: 410, mail: 150 },
    { month: "2025-12", online: 690, counter: 400, mail: 170 },
    { month: "2026-01", online: 560, counter: 300, mail: 120 },
    { month: "2026-02", online: 650, counter: 330, mail: 140 },
    { month: "2026-03", online: 940, counter: 420, mail: 180 },
    { month: "2026-04", online: 1120, counter: 430, mail: 170 },
    { month: "2026-05", online: 910, counter: 340, mail: 140 },
    { month: "2026-06", online: 880, counter: 310, mail: 120 },
    { month: "2026-07", online: 1010, counter: 320, mail: 120 },
    { month: "2026-08", online: 920, counter: 260, mail: 100 },
    { month: "2026-09", online: 1020, counter: 250, mail: 90 },
    { month: "2026-10", online: 1150, counter: 240, mail: 90 },
];

const series = [
    { key: "online", name: "オンライン" },
    { key: "counter", name: "窓口" },
    { key: "mail", name: "郵送" },
];

const demo: ComponentDemo = {
    slug: "area-chart",
    title: "積み上げ面グラフ",
    category: "グラフ",
    description: "数量と構成比の時間変化を同時に見せる。構成比だけを見せたいときは 100% 積み上げ。面の塗りは透過ではなく系列色 + 模様で区別する。",
    source: "@/components/charts/AreaChart",
    examples: [
        {
            title: "積み上げ（実数）",
            description: "合計の推移と内訳を同時に読める。2 系列目以降は模様を重ねる。",
            render: () => <AreaChart title="申請経路別の申請件数の月次推移" unit="件" data={byChannel} xKey="month" xAxisLabel="年月" series={series} source="申請管理システム" updatedAt="2026-10-31" />,
        },
        {
            title: "100% 積み上げ（構成比）",
            description: "percent=true で Y 軸を % にする。ツールチップとデータテーブルには実数と割合を併記する。",
            render: () => (
                <AreaChart title="申請経路の構成比の月次推移" unit="件" percent data={byChannel} xKey="month" series={series} note="各月の申請件数に対する割合" updatedAt="2026-10-31" />
            ),
        },
        {
            title: "積み上げなし・模様なし",
            description: "stacked=false で重ねずに描く（手前の面が奥を隠すため、系列は 2 つまでにとどめる）。",
            render: () => (
                <AreaChart
                    title="オンライン・窓口申請件数の月次推移"
                    unit="件"
                    stacked={false}
                    patterns={false}
                    height="sm"
                    data={byChannel}
                    xKey="month"
                    series={[
                        { key: "counter", name: "窓口" },
                        { key: "online", name: "オンライン" },
                    ]}
                />
            ),
        },
    ],
};

export default demo;
