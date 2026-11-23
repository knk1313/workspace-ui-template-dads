// ダッシュボードの集計の API（ダミー）。画面はこの関数だけを通して集計を読む。
// 実際の API に置き換えるときは、getDashboardSummary の中身を fetch などに差し替える（戻り値の型は変えない）。
// 見本の画面を消すとき（npm run remove-samples）は、このファイルも消える。

import { DATA_SOURCE, KPIS, MONTHLY_RECEIVED, RECEIVED_BY_CATEGORY, RECEIVED_BY_CHANNEL } from "@/mocks/dashboard";
import { mockRequest } from "./mock";
import { defineQuery } from "./query";

export type DashboardPeriod = "thisMonth" | "lastMonth" | "thisYear";

export type Kpi = {
    key: string;
    label: string;
    value: string;
    unit?: string;
    delta?: { value: string; trend: "up" | "down" | "flat"; label: string };
    note?: string;
};

export type DashboardSummary = {
    kpis: Kpi[];
    /** 月次の受付件数（直近12か月と前年同月）。 */
    monthlyReceived: { month: string; label: string; current: number; previous: number }[];
    /** 種別ごとの受付件数。 */
    receivedByCategory: { category: string; count: number }[];
    /** 受付経路ごとの件数。 */
    receivedByChannel: { name: string; value: number }[];
    /** 出典と集計の時点（「出典：…、2026年11月1日9:00時点」）。 */
    dataSource: string;
};

/**
 * 期間の集計を返す。
 * 見本のデータは今月（2026年10月）の分しかないため、どの期間でも同じ値を返す（画面は今月以外でその旨を知らせる）。
 */
export function getDashboardSummary(period: DashboardPeriod): Promise<DashboardSummary> {
    void period;
    return mockRequest(() => ({
        kpis: KPIS,
        monthlyReceived: MONTHLY_RECEIVED,
        receivedByCategory: RECEIVED_BY_CATEGORY,
        receivedByChannel: RECEIVED_BY_CHANNEL,
        dataSource: DATA_SOURCE,
    }));
}

/** 画面が useQuery に渡す、読み込みのキーと関数の組。 */
export const dashboardQueries = {
    summary: (period: DashboardPeriod) => defineQuery(`dashboard/${period}`, () => getDashboardSummary(period)),
};
