import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, SearchX, Trash2, UserRoundPen } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { EmptyState } from "@/components/ui/EmptyState";
import { Link } from "@/components/ui/Link";
import { LoadError } from "@/components/ui/LoadError";
import { PageHeader } from "@/components/ui/PageHeader";
import { TableCellLine } from "@/components/ui/Table";
import { useToast } from "@/components/ui/Toast";
import { useDisplaySettings } from "@/context/DisplaySettings";
import { assignApplications, deleteApplications as deleteApi, invalidateApplications, listApplications, restoreApplications } from "@/api/applications";
import { setQueryData, useMutation, useQuery } from "@/api/query";
import { CATEGORY_LABELS, STATUS_LABELS, type Application } from "@/api/applicationTypes";
import { ApplicationFilters } from "./list/ApplicationFilters";
import { ApplicationStatusChip } from "./list/ApplicationStatusChip";
import { AssignDialog } from "./list/AssignDialog";
import { formatAmount } from "./list/format";
import { filterApplications, hasFilters, useApplicationQuery } from "./list/useApplicationQuery";

// 申請一覧。検索・絞り込み（URL に保存）→ データテーブル（並べ替え・行選択・ページ送り）→ 一括操作 / 行ごとの操作。
// データは src/api/ のダミー API から読み書きする（画面を移っても保たれ、再読み込みで元に戻る）。
// 削除は確認ダイアログを出さずにすぐ行い、トーストの「元に戻す」で取り消せるようにする（DADS: 確認ダイアログだけを安全対策にしない）。

const PAGE_SIZE = 20;
const QUERY_KEY = "applications";

const STATUS_ORDER = Object.keys(STATUS_LABELS);

export default function ApplicationListPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { formatDateTime } = useDisplaySettings();
    const { query, search, setFilter, clearFilters, setSort, setPage } = useApplicationQuery();

    const list = useQuery(QUERY_KEY, listApplications);
    const applications = useMemo(() => list.data ?? [], [list.data]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [assignOpen, setAssignOpen] = useState(false);
    const assign = useMutation(assignApplications);

    const rows = useMemo(() => filterApplications(applications, query), [applications, query]);
    const filtered = hasFilters(query);

    // 詳細画面のパンくず「申請一覧」から、この絞り込み状態に戻れるよう検索条件を渡す
    const detailState = { listSearch: search ? `?${search}` : "" };

    // 条件を変えたら選択を解除する（見えていない行を気付かずに一括操作しないように）
    const changeFilter = (...args: Parameters<typeof setFilter>) => {
        setSelectedIds([]);
        setFilter(...args);
    };
    const clearAll = () => {
        setSelectedIds([]);
        clearFilters();
    };

    async function deleteApplications(targets: Application[]) {
        const ids = new Set(targets.map((t) => t.id));
        // 「R08-001060を削除しました」「3件の申請を削除しました」
        const label = targets.length === 1 ? targets[0].number : `${targets.length}件の申請`;
        // 通信の結果を待たずに一覧から消し（楽観的な更新）、失敗したら読み込み直して元に戻す
        setQueryData<Application[]>(QUERY_KEY, (prev) => (prev ?? []).filter((a) => !ids.has(a.id)));
        setSelectedIds((prev) => prev.filter((id) => !ids.has(id)));
        try {
            const deleted = await deleteApi([...ids]);
            // 消えた行にあったフォーカスの移し先として、「元に戻す」へフォーカスを移す（キーボードでもすぐ取り消せる）
            toast({ type: "success", title: `${label}を削除しました`, action: { label: "元に戻す", focus: true, onClick: () => void undoDelete(deleted, label) } });
        } catch {
            toast({ type: "error", title: `${label}を削除できませんでした`, description: "時間をおいて、もう一度削除してください。" });
        } finally {
            invalidateApplications();
        }
    }

    async function undoDelete(deleted: Application[], label: string) {
        try {
            await restoreApplications(deleted);
            toast({ type: "success", title: `${label}を元に戻しました` });
        } catch {
            toast({ type: "error", title: `${label}を元に戻せませんでした`, description: "時間をおいて、もう一度「元に戻す」を押してください。" });
        } finally {
            invalidateApplications();
        }
    }

    async function assignSelected(assignee: string) {
        try {
            await assign.run(selectedIds, assignee);
            toast({ type: "success", title: `${selectedIds.length}件の担当者を${assignee}に変更しました` });
            setAssignOpen(false);
            invalidateApplications();
        } catch {
            // ダイアログは閉じずに残し、そのままやり直せるようにする
            toast({ type: "error", title: "担当者を変更できませんでした", description: "時間をおいて、もう一度変更してください。" });
        }
    }

    const columns: DataTableColumn<Application>[] = [
        {
            // PC 幅で表が左右に収まるよう、受付番号と件名を 1 列にまとめる（ダッシュボードの「最近の申請」と同じ形）。
            // 並べ替えは受付番号で行う。
            key: "number",
            header: "受付番号・件名",
            accessor: (row) => row.number,
            render: (row) => (
                <span className="flex min-w-32 flex-col">
                    <Link to={`/applications/${row.id}`} state={detailState} className="self-start whitespace-nowrap">
                        {row.number}
                    </Link>
                    <span className="font-normal">{row.title}</span>
                </span>
            ),
            sortable: true,
            rowHeader: true,
            skeleton: "lines",
        },
        { key: "applicant", header: "申請者", accessor: (row) => row.applicant, sortable: true, width: "w-30 whitespace-nowrap" },
        { key: "category", header: "種別", accessor: (row) => CATEGORY_LABELS[row.category], sortable: true, width: "w-22 whitespace-nowrap" },
        {
            key: "status",
            header: "状態",
            // 表示名の五十音ではなく、手続きの進む順（下書き → 受付済み → … ）で並べる
            accessor: (row) => STATUS_ORDER.indexOf(row.status),
            render: (row) => (
                <TableCellLine>
                    <ApplicationStatusChip status={row.status} />
                </TableCellLine>
            ),
            sortable: true,
            width: "w-28 whitespace-nowrap",
            skeleton: "chip",
        },
        {
            key: "amount",
            header: "申請額",
            accessor: (row) => row.amount,
            render: (row) => formatAmount(row.amount) ?? <span className="text-text-muted">なし</span>,
            sortable: true,
            align: "right",
            width: "w-32 whitespace-nowrap",
        },
        { key: "assignee", header: "担当者", accessor: (row) => row.assignee, sortable: true, width: "w-26 whitespace-nowrap" },
        {
            key: "updatedAt",
            header: "更新日時",
            accessor: (row) => row.updatedAt,
            // 日付と時刻の間で折り返せるようにし、列幅を日付 1 つ分に抑える
            render: (row) => <time dateTime={row.updatedAt}>{formatDateTime(row.updatedAt)}</time>,
            sortable: true,
            align: "right",
            width: "w-32",
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="申請一覧"
                breadcrumbs={[{ label: "ホーム", href: "/" }, { label: "申請一覧" }]}
                actions={
                    <ButtonLink to="/applications/new" variant="solid-fill" leadIcon={Plus}>
                        新規申請
                    </ButtonLink>
                }
            />

            <ApplicationFilters
                query={query}
                resultCount={list.data ? rows.length : undefined}
                loading={list.isLoading}
                onFilterChange={changeFilter}
                onClear={clearAll}
            />

            {list.error && <LoadError subject="申請の一覧" error={list.error} onRetry={list.reload} stale={!!list.data} />}

            {/* 表は地（canvas）に直接置かず、白い面（カード）に載せる（docs/decisions.md D-07）。
                一度も読み込めていないときは、空の表（「申請はまだありません」）と誤解されないよう表を出さない。 */}
            {!(list.error && !list.data) && (
                <Card>
                    <CardBody>
                        <DataTable
                            flush
                            columns={columns}
                            rows={rows}
                            getRowId={(row) => row.id}
                            getRowLabel={(row) => `${row.number}「${row.title}」`}
                            loading={list.isLoading}
                            // 表の中だけを縦スクロールさせるとページのスクロールと二重になり、最終行が切れて見えるため固定ヘッダーは使わない（20 件ずつのページ送りで十分短い）。
                            sort={query.sort}
                            onSortChange={setSort}
                            page={query.page}
                            onPageChange={setPage}
                            pageSize={PAGE_SIZE}
                            selectable
                            selectedIds={selectedIds}
                            onSelectionChange={setSelectedIds}
                            bulkActions={
                                <>
                                    <Button variant="outline" size="sm" leadIcon={UserRoundPen} onClick={() => setAssignOpen(true)}>
                                        担当者を変更
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        tone="error"
                                        leadIcon={Trash2}
                                        onClick={() => deleteApplications(applications.filter((a) => selectedIds.includes(a.id)))}
                                    >
                                        削除
                                    </Button>
                                </>
                            }
                            rowActions={(row) => (
                                <DropdownMenu
                                    label={`${row.number}の操作`}
                                    iconOnly
                                    size="sm"
                                    align="end"
                                    items={[
                                        { label: "詳細を見る", onSelect: () => navigate(`/applications/${row.id}`, { state: detailState }) },
                                        { label: "編集", onSelect: () => navigate(`/applications/${row.id}/edit`) },
                                        "separator",
                                        { label: "削除", danger: true, icon: Trash2, onSelect: () => deleteApplications([row]) },
                                    ]}
                                />
                        )}
                        emptyState={
                            filtered ? (
                                <EmptyState
                                    icon={SearchX}
                                    title="条件に合う申請はありません"
                                    description="キーワードや絞り込みの条件を変えて、もう一度検索してください"
                                    action={
                                        <Button variant="outline" onClick={clearAll}>
                                            条件をクリア
                                        </Button>
                                    }
                                />
                            ) : (
                                <EmptyState
                                    title="最初の申請を登録"
                                    description="まだ申請がありません。「新規申請」から登録すると、ここに表示されます。"
                                    action={
                                        <ButtonLink to="/applications/new" leadIcon={Plus}>
                                            新規申請
                                        </ButtonLink>
                                    }
                                />
                            )
                        }
                    />
                </CardBody>
            </Card>
            )}

            {assignOpen && <AssignDialog count={selectedIds.length} pending={assign.pending} onClose={() => setAssignOpen(false)} onSubmit={assignSelected} />}
        </div>
    );
}
