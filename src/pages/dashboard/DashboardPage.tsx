import { useState } from "react";
import { ChevronRight, CircleCheck, Download, FilePlus2, MessageSquare, PenLine, Undo2, UserRoundCog, type LucideIcon } from "lucide-react";
import { BarChart, DonutChart, LineChart } from "@/components/charts";
import { ActivityFeed, type ActivityItem as FeedItem } from "@/components/ui/ActivityFeed";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/Card";
import { StatusChip, type ChipStatus } from "@/components/ui/ChipLabel";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Link } from "@/components/ui/Link";
import { LoadError } from "@/components/ui/LoadError";
import { NotificationBanner } from "@/components/ui/NotificationBanner";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import { StatCard } from "@/components/ui/StatCard";
import { TableCellLine } from "@/components/ui/Table";
import { useToast } from "@/components/ui/Toast";
import { useDisplaySettings } from "@/context/DisplaySettings";
import { useMediaQuery } from "@/layouts/useMediaQuery";
import { applicationQueries } from "@/api/applications";
import { useQuery } from "@/api/query";
import { STATUS_LABELS, type ActivityItem, type Application, type ApplicationStatus } from "@/api/applicationTypes";
import { dashboardQueries, type DashboardPeriod } from "@/api/dashboard";
import { usePageTitle } from "@/hooks/usePageTitle";

// ダッシュボード（ダッシュボードデザインの実践ガイドブック / docs/chart-guide.md の画面構成）。
//   左上から右下へ「全体 → 部分」: 期間の切り替え（上部）→ KPI（左上を強調）→ 推移 → 内訳 → 最新の一覧（右下 = 最も詳細）。
//   グラフは必ず出典・注記・更新日を付け、データテーブルに切り替えられるようにする（ChartFrame）。

type Period = DashboardPeriod;

// 期間を変えると、その期間の集計を API から読み直す（見本の API は、どの期間でも今月の値を返す）。
const PERIODS: { value: Period; label: string; range: string }[] = [
    { value: "thisMonth", label: "今月", range: "2026年10月1日〜10月31日" },
    { value: "lastMonth", label: "先月", range: "2026年9月1日〜9月30日" },
    { value: "thisYear", label: "今年度", range: "2026年4月1日〜10月31日" },
];

// グラフのメタ情報。PageHeader の出典（集計の API の dataSource）と同じ時点を指す。
const CHART_SOURCE = "申請管理システム（架空データ）";
const CHART_UPDATED_AT = "2026年11月1日9:00";
const MONTHLY_TARGET = 1200;

// 状態の意味に合わせてチップの色を決める（色だけに頼らず、ラベルの文言で状態を伝える）。
const STATUS_CHIP: Record<ApplicationStatus, ChipStatus> = {
    draft: "neutral",
    submitted: "info",
    reviewing: "info",
    approved: "success",
    returned: "warning",
    rejected: "error",
};

const ACTIVITY_ICON: Record<ActivityItem["type"], LucideIcon> = {
    create: FilePlus2,
    update: PenLine,
    approve: CircleCheck,
    return: Undo2,
    comment: MessageSquare,
    assign: UserRoundCog,
};

const RECENT_COUNT = 8;

/** sm（40rem = 640px）。これより狭いとドーナツの外側のラベルがカードからはみ出す。 */
const SM_QUERY = "(min-width: 40rem)";

const yen = new Intl.NumberFormat("ja-JP");

export default function DashboardPage() {
    usePageTitle("ダッシュボード");
    const { toast } = useToast();
    const { formatDateTime } = useDisplaySettings();
    const [period, setPeriod] = useState<Period>("thisMonth");
    // 狭い画面ではドーナツの外側ラベルを消し、凡例とデータテーブルで値を補う（DonutChart の showLabels の規約）。
    const roomyChart = useMediaQuery(SM_QUERY);
    const current = PERIODS.find((p) => p.value === period) ?? PERIODS[0];
    const summary = useQuery(dashboardQueries.summary(period));
    const data = summary.data;

    // 右下の一覧は「いま何が動いているか」を見るためのものなので、更新日の新しい順に絞って出す。
    // 「最近の申請」と「アクティビティ」は承認や削除で変わるので API から読む（集計値とグラフは見本の固定値）
    // 表に出す件数だけを API から受け取る（全件を読んで画面で並べ替えない）
    const applications = useQuery(applicationQueries.recent(RECENT_COUNT));
    const recentActivity = useQuery(applicationQueries.recentActivity);
    const recent = applications.data ?? [];

    // 件名以外は折り返すと読みにくい（番号・日時が 2 行に割れる）ので折り返さない。幅が足りないときは表の中だけ横スクロールする。
    const columns: DataTableColumn<Application>[] = [
        {
            // 番号だけでは中身が分からないので件名を添える。列を増やさず 1 列にまとめ、表の幅を抑える。
            key: "number",
            header: "受付番号・件名",
            rowHeader: true,
            render: (row) => (
                <span className="flex flex-col gap-0.5">
                    <Link to={`/applications/${row.id}`} className="w-fit whitespace-nowrap">
                        {row.number}
                    </Link>
                    <span className="text-14 font-normal text-text-muted">{row.title}</span>
                </span>
            ),
        },
        {
            key: "status",
            header: "状態",
            render: (row) => (
                <TableCellLine>
                    <StatusChip status={STATUS_CHIP[row.status]}>{STATUS_LABELS[row.status]}</StatusChip>
                </TableCellLine>
            ),
            width: "whitespace-nowrap",
        },
        {
            key: "amount",
            header: "申請額（円）",
            align: "right",
            width: "whitespace-nowrap",
            // 金額のない申請（届出など）は 0 ではなく「—」にして、0 円と区別する。
            render: (row) => (row.amount > 0 ? yen.format(row.amount) : <span aria-label="なし">—</span>),
        },
        {
            key: "updatedAt",
            header: "更新日時",
            align: "right",
            width: "whitespace-nowrap",
            render: (row) => <time dateTime={row.updatedAt}>{formatDateTime(row.updatedAt)}</time>,
        },
    ];

    const activity: FeedItem[] = (recentActivity.data ?? []).map((a) => ({
        id: a.id,
        actor: a.actor,
        action: a.action,
        target: a.target && a.applicationId ? <Link to={`/applications/${a.applicationId}`}>{a.target}</Link> : a.target,
        time: a.at,
        timeLabel: formatDateTime(a.at),
        icon: ACTIVITY_ICON[a.type],
    }));

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="ダッシュボード"
                description={`対象期間：${current.label}（${current.range}）`}
                meta={summary.data?.dataSource}
                actions={
                    <>
                        {/* フィルターは上部に置き、影響を受ける情報をその下に並べる（ガイドブック）。 */}
                        <div className="flex items-center gap-2">
                            <label htmlFor="dashboard-period" className="text-16 font-bold text-text">
                                表示期間
                            </label>
                            <Select id="dashboard-period" value={period} onChange={(e) => setPeriod(e.target.value as Period)} options={PERIODS.map((p) => ({ value: p.value, label: p.label }))} />
                        </div>
                        <Button
                            variant="outline"
                            leadIcon={Download}
                            onClick={() => toast({ title: "見本のため、CSVはダウンロードしません", description: "実装するときは、集計結果をCSVで出力してください", type: "info" })}
                        >
                            CSVをダウンロード
                        </Button>
                    </>
                }
            />

            {/* 見本の集計値は今月の分しかない。期間を変えても数字が変わらないことを、数字を読み違えないよう画面で伝える */}
            {period !== "thisMonth" && (
                <NotificationBanner type="info" title="見本のため、どの期間を選んでも、指標とグラフは今月（2026年10月）の値のままです" live />
            )}

            {summary.error && !data ? (
                <LoadError subject="集計" error={summary.error} onRetry={summary.reload} />
            ) : !data ? (
                <div className="flex flex-col gap-4" aria-busy="true">
                    <p role="status" className="sr-only">
                        集計を読み込んでいます
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {[0, 1, 2, 3].map((i) => (
                            <Skeleton key={i} variant="rect" className="h-32" />
                        ))}
                    </div>
                    <Skeleton variant="rect" className="h-80" />
                </div>
            ) : (
                <>
                <section aria-labelledby="dashboard-kpi">
                    <h2 id="dashboard-kpi" className="sr-only">
                        主な指標
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {data.kpis.map((kpi, i) => (
                            // 左上（最初の 1 枚）は全体を示す指標なので強調する。
                            <StatCard key={kpi.key} label={kpi.label} value={kpi.value} unit={kpi.unit} delta={kpi.delta} note={kpi.note} highlight={i === 0} />
                        ))}
                    </div>
                </section>

                <Card>
                    <CardBody>
                        <LineChart
                            as="h2"
                            title="受付件数の月次推移"
                            unit="件"
                            description="直近12か月と前年同月を比べます。「月間目標」の線とも比べられます。"
                            data={data.monthlyReceived}
                            xKey="label"
                            xAxisLabel="月"
                            series={[
                                { key: "current", name: "直近12か月" },
                                { key: "previous", name: "前年同月" },
                            ]}
                            referenceLine={{ y: MONTHLY_TARGET, label: `月間目標（${yen.format(MONTHLY_TARGET)}件）` }}
                            source={CHART_SOURCE}
                            note="2025年11月〜2026年10月の各月末時点。下書きを除く。"
                            updatedAt={CHART_UPDATED_AT}
                        />
                    </CardBody>
                </Card>

                {/* lg（1024px）ではサイドバーの分だけ本文が狭く、2 列にするとドーナツのラベルが切れるため xl から 2 列にする。 */}
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <Card>
                        <CardBody>
                            <BarChart
                                as="h2"
                                title="種別ごとの受付件数（今月）"
                                unit="件"
                                layout="horizontal"
                                sorted
                                showValues
                                data={data.receivedByCategory}
                                xKey="category"
                                xAxisLabel="種別"
                                series={[{ key: "count", name: "受付件数" }]}
                                source={CHART_SOURCE}
                                note="2026年10月1日〜31日の受付分。"
                                updatedAt={CHART_UPDATED_AT}
                            />
                        </CardBody>
                    </Card>
                    <Card>
                        <CardBody>
                            <DonutChart
                                as="h2"
                                title="受付経路の構成比（今月）"
                                unit="件"
                                centerLabel="合計"
                                showLabels={roomyChart}
                                data={data.receivedByChannel}
                                source={CHART_SOURCE}
                                note="2026年10月1日〜31日の受付分。"
                                updatedAt={CHART_UPDATED_AT}
                            />
                        </CardBody>
                    </Card>
                </div>
                </>
            )}

            {/* 右下が最も詳細な一覧。表は 5 列あり、サイドバー付きの 1280px 幅で 2/3 にすると更新日時が切れるため、
                アクティビティを右に並べるのは2xl（1536px）以上にし、それ未満では表の下に置く。 */}
            <div className="grid grid-cols-1 gap-4 2xl:grid-cols-3">
                <Card as="section" className="2xl:col-span-2">
                    <CardHeader title="最近の申請" description={`更新日の新しい順に${RECENT_COUNT}件を表示しています`} />
                    <CardBody>
                        {applications.error && !applications.data ? (
                            <LoadError subject="最近の申請" error={applications.error} onRetry={applications.reload} />
                        ) : (
                            <DataTable
                                size="dense"
                                columns={columns}
                                rows={recent}
                                loading={applications.isLoading}
                                skeletonRows={RECENT_COUNT}
                                getRowId={(row) => row.id}
                                caption={<span className="sr-only">最近の申請</span>}
                            />
                        )}
                    </CardBody>
                    <CardFooter className="flex items-center justify-end">
                        <ButtonLink to="/applications" variant="text" size="sm" tailIcon={ChevronRight}>
                            申請一覧へ
                        </ButtonLink>
                    </CardFooter>
                </Card>
                <Card as="section">
                    <CardHeader title="最近の操作" />
                    <CardBody>
                        {recentActivity.error && !recentActivity.data ? (
                            <LoadError subject="最近の操作" error={recentActivity.error} onRetry={recentActivity.reload} />
                        ) : recentActivity.isLoading ? (
                            <div aria-busy="true" className="flex flex-col gap-6">
                                <p role="status" className="sr-only">
                                    最近の操作を読み込んでいます
                                </p>
                                {Array.from({ length: 4 }, (_, i) => (
                                    <div key={i} className="flex gap-3">
                                        <Skeleton variant="circle" className="size-8 shrink-0" />
                                        <Skeleton lines={2} className="flex-1" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <ActivityFeed items={activity} />
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
