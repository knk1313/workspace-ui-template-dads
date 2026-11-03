import { LineChart } from "@/components/charts/LineChart";
import type { ComponentDemo } from "./types";

// 月次の申請件数（ダミー）。
const monthly = [
    { month: "2025-11", applications: 1180, approvals: 920, rejections: 84 },
    { month: "2025-12", applications: 1260, approvals: 1010, rejections: 91 },
    { month: "2026-01", applications: 980, approvals: 790, rejections: 62 },
    { month: "2026-02", applications: 1120, approvals: 905, rejections: 70 },
    { month: "2026-03", applications: 1540, approvals: 1230, rejections: 118 },
    { month: "2026-04", applications: 1720, approvals: 1360, rejections: 132 },
    { month: "2026-05", applications: 1390, approvals: 1140, rejections: 95 },
    { month: "2026-06", applications: 1310, approvals: 1080, rejections: 88 },
    { month: "2026-07", applications: 1450, approvals: 1190, rejections: 101 },
    { month: "2026-08", applications: 1280, approvals: 1050, rejections: 83 },
    { month: "2026-09", applications: 1360, approvals: 1120, rejections: 90 },
    { month: "2026-10", applications: 1480, approvals: 1210, rejections: 97 },
];

// 平均処理日数（ダミー）。5 系列の形・線種の違いを見せる。
const weekly = Array.from({ length: 8 }, (_, i) => ({
    week: `第${i + 1}週`,
    north: 6.2 + Math.sin(i / 2) * 1.1,
    east: 5.1 + Math.cos(i / 3) * 0.9,
    central: 7.4 - i * 0.25,
    west: 4.8 + (i % 3) * 0.4,
    south: 5.9 + Math.sin(i) * 0.6,
})).map((d) => Object.fromEntries(Object.entries(d).map(([k, v]) => [k, typeof v === "number" ? Math.round(v * 10) / 10 : v])));

const demo: ComponentDemo = {
    slug: "line-chart",
    title: "折れ線グラフ",
    category: "グラフ",
    description: "時間変化・傾向を見せる。横軸は時間。系列ごとにデータ点の形と線種を変え、色だけに依存しない。原点は 0、グリッドは横線のみ。",
    source: "@/components/charts/LineChart",
    examples: [
        {
            title: "単一系列",
            description: "タイトルは「内容 + データ種別」。出典・注記・更新日でデータを定義する。「データテーブルを表示」で同じデータの表を開ける。",
            render: () => (
                <LineChart
                    title="申請件数の月次推移"
                    unit="件"
                    data={monthly}
                    xKey="month"
                    series={[{ key: "applications", name: "申請件数" }]}
                    xAxisLabel="年月"
                    source="申請管理システム"
                    note="取り下げられた申請を除く"
                    updatedAt="2026-10-31"
                />
            ),
        },
        {
            title: "複数系列 + 目標線",
            description: "比較対象（目標値）を破線で示す。凡例はグラフの直上に置き、記号は色 + 形 + 線種。",
            render: () => (
                <LineChart
                    title="申請・承認・差し戻し件数の月次推移"
                    unit="件"
                    data={monthly}
                    xKey="month"
                    series={[
                        { key: "applications", name: "申請" },
                        { key: "approvals", name: "承認" },
                        { key: "rejections", name: "差し戻し" },
                    ]}
                    referenceLine={{ y: 1500, label: "目標 1,500 件" }}
                    description="承認は申請の翌月に計上されるため、月末の申請は翌月の承認に含まれます。"
                    source="申請管理システム"
                    updatedAt="2026-10-31"
                />
            ),
        },
        {
            title: "5 系列（上限）・小さい高さ",
            description: "系列は最大 5。circle / square / triangle / diamond / cross の形と実線 / 破線の組み合わせで区別する。height=\"sm\" で 160px。",
            render: () => (
                <LineChart
                    title="地域別の平均処理日数の週次推移"
                    unit="日"
                    yAxisLabel="処理日数（日）"
                    height="sm"
                    data={weekly}
                    xKey="week"
                    series={[
                        { key: "north", name: "北部" },
                        { key: "east", name: "東部" },
                        { key: "central", name: "中央" },
                        { key: "west", name: "西部" },
                        { key: "south", name: "南部" },
                    ]}
                    updatedAt="2026-10-31"
                />
            ),
        },
        {
            title: "データ点なし",
            description: "データ点が多く重なるときは showDots=false。凡例は線種だけで区別する。",
            render: () => (
                <LineChart
                    title="承認件数の月次推移"
                    unit="件"
                    data={monthly}
                    xKey="month"
                    series={[
                        { key: "applications", name: "申請" },
                        { key: "approvals", name: "承認" },
                    ]}
                    showDots={false}
                />
            ),
        },
    ],
};

export default demo;
