// ダッシュボード用の架空データ。実在の数値とは関係ありません。

export type Kpi = {
    key: string;
    label: string;
    value: string;
    unit?: string;
    delta?: { value: string; trend: "up" | "down" | "flat"; label: string };
    note?: string;
};

export const KPIS: Kpi[] = [
    { key: "received", label: "今月の受付件数", value: "1,284", unit: "件", delta: { value: "+8.2%", trend: "up", label: "前月比" }, note: "2026年10月1日〜31日" },
    { key: "pending", label: "処理待ち", value: "137", unit: "件", delta: { value: "-12", trend: "down", label: "前週比" }, note: "受付済み・審査中の合計" },
    { key: "leadTime", label: "平均処理日数", value: "6.4", unit: "日", delta: { value: "-0.8日", trend: "down", label: "前月比" }, note: "受付から決定まで（目標 7 日）" },
    { key: "approval", label: "承認率", value: "91.3", unit: "%", delta: { value: "+0.4pt", trend: "up", label: "前月比" }, note: "差戻しを除く" },
];

/** 月次の受付件数（今年度と前年度）。 */
export const MONTHLY_RECEIVED = [
    { month: "2025-11", label: "11月", current: 1021, previous: 968 },
    { month: "2025-12", label: "12月", current: 1130, previous: 1004 },
    { month: "2026-01", label: "1月", current: 980, previous: 912 },
    { month: "2026-02", label: "2月", current: 1045, previous: 955 },
    { month: "2026-03", label: "3月", current: 1310, previous: 1180 },
    { month: "2026-04", label: "4月", current: 1422, previous: 1290 },
    { month: "2026-05", label: "5月", current: 1188, previous: 1102 },
    { month: "2026-06", label: "6月", current: 1204, previous: 1075 },
    { month: "2026-07", label: "7月", current: 1156, previous: 1089 },
    { month: "2026-08", label: "8月", current: 1097, previous: 1011 },
    { month: "2026-09", label: "9月", current: 1187, previous: 1120 },
    { month: "2026-10", label: "10月", current: 1284, previous: 1186 },
];

/** 種別ごとの受付件数（今月）。大小順。 */
export const RECEIVED_BY_CATEGORY = [
    { category: "証明書", count: 486 },
    { category: "届出", count: 312 },
    { category: "補助金", count: 241 },
    { category: "許認可", count: 173 },
    { category: "その他", count: 72 },
];

/** 受付窓口の構成比（今月）。合計 1,284 件。 */
export const RECEIVED_BY_CHANNEL = [
    { name: "オンライン", value: 812 },
    { name: "窓口", value: 331 },
    { name: "郵送", value: 141 },
];

/** 処理日数の分布（今月、件数）。 */
export const LEAD_TIME_DISTRIBUTION = [
    { bucket: "3日以内", count: 402 },
    { bucket: "4〜7日", count: 561 },
    { bucket: "8〜14日", count: 238 },
    { bucket: "15日以上", count: 83 },
];

export const DATA_SOURCE = "出典: 申請管理システム（架空データ）。2026年11月1日 9:00 時点。";
