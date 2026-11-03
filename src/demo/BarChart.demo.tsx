import { BarChart } from "@/components/charts/BarChart";
import { SEQUENTIAL_COLORS } from "@/components/charts/chartUtils";
import type { ComponentDemo } from "./types";

// 地域別の申請件数（ダミー）。
const byRegion = [
    { region: "北海道・東北", online: 1240, counter: 860, mail: 310 },
    { region: "関東", online: 4820, counter: 1930, mail: 720 },
    { region: "中部", online: 2110, counter: 1240, mail: 480 },
    { region: "近畿", online: 2860, counter: 1410, mail: 530 },
    { region: "中国・四国", online: 980, counter: 720, mail: 260 },
    { region: "九州・沖縄", online: 1530, counter: 910, mail: 340 },
];

// 月別（日付順を保つ例）。
const byMonth = [
    { month: "4月", applications: 1720 },
    { month: "5月", applications: 1390 },
    { month: "6月", applications: 1310 },
    { month: "7月", applications: 1450 },
    { month: "8月", applications: 1280 },
    { month: "9月", applications: 1360 },
];

// 満足度（順序のある段階。単一色相パレットの例）。
const satisfaction = [
    { level: "満足", count: 412 },
    { level: "やや満足", count: 638 },
    { level: "どちらともいえない", count: 295 },
    { level: "やや不満", count: 148 },
    { level: "不満", count: 57 },
];

const demo: ComponentDemo = {
    slug: "bar-chart",
    title: "棒グラフ",
    category: "グラフ",
    description: "数量の比較。まず棒を検討する。縦棒 / 横棒、集合 / 積み上げ、値ラベル、大小順の並べ替えに対応。棒は角丸なし、幅は最大 48px。",
    source: "@/components/charts/BarChart",
    examples: [
        {
            title: "縦棒（日付順）",
            description: "時間軸を持つカテゴリーは日付順のまま並べる（意味のある順列）。",
            render: () => (
                <BarChart title="申請件数の月別比較" unit="件" data={byMonth} xKey="month" xAxisLabel="月" series={[{ key: "applications", name: "申請件数" }]} source="申請管理システム" updatedAt="2026-10-31" />
            ),
        },
        {
            title: "横棒（大小順）",
            description: "カテゴリー名が長いときは横棒。sorted=true で合計の大きい順に並べ替える。",
            render: () => (
                <BarChart
                    title="地域別の申請件数（オンライン）"
                    unit="件"
                    layout="horizontal"
                    sorted
                    data={byRegion}
                    xKey="region"
                    xAxisLabel="地域"
                    series={[{ key: "online", name: "オンライン申請" }]}
                    referenceLine={{ y: 2250, label: "全国平均 2,250 件" }}
                />
            ),
        },
        {
            title: "集合棒（3 系列）",
            description: "2 系列目以降は模様（斜線・ドット）を重ね、色だけに依存しない。凡例の記号も同じ模様。",
            render: () => (
                <BarChart
                    title="地域・申請経路別の申請件数"
                    unit="件"
                    data={byRegion}
                    xKey="region"
                    series={[
                        { key: "online", name: "オンライン" },
                        { key: "counter", name: "窓口" },
                        { key: "mail", name: "郵送" },
                    ]}
                    updatedAt="2026-10-31"
                />
            ),
        },
        {
            title: "積み上げ棒 + 合計の値ラベル",
            description: "stacked で積み上げる。showValues を付けると最上段に合計を表示する。",
            render: () => (
                <BarChart
                    title="地域別の申請件数（経路の内訳）"
                    unit="件"
                    layout="horizontal"
                    stacked
                    showValues
                    sorted
                    data={byRegion}
                    xKey="region"
                    series={[
                        { key: "online", name: "オンライン" },
                        { key: "counter", name: "窓口" },
                        { key: "mail", name: "郵送" },
                    ]}
                />
            ),
        },
        {
            title: "値ラベル + 単一色相（順序のある段階）",
            description: "順序のある段階には SEQUENTIAL_COLORS を渡す。薄い色（4・5 番目）は背景とのコントラストが 3:1 未満のため showValues で数値を併記する。",
            render: () => (
                <BarChart
                    title="利用者満足度の回答数"
                    unit="人"
                    showValues
                    patterns={false}
                    data={satisfaction}
                    xKey="level"
                    series={[{ key: "count", name: "回答数" }]}
                    palette={SEQUENTIAL_COLORS}
                    note="回答数 1,550 人、2026 年 9 月実施"
                />
            ),
        },
    ],
};

export default demo;
