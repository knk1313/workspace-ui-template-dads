import { useEffect, useMemo, useState } from "react";
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
import { applicationQueries, assignApplications, invalidateApplications } from "@/api/applications";
import { setQueryData, useMutation, useQuery } from "@/api/query";
import { CATEGORY_LABELS, type Application, type ApplicationListPage } from "@/api/applicationTypes";
import { ApplicationFilters } from "./list/ApplicationFilters";
import { ApplicationStatusChip } from "./list/ApplicationStatusChip";
import { AssignDialog } from "./list/AssignDialog";
import { useStaffOptions } from "./useStaffOptions";
import { useUndoableDelete } from "./useUndoableDelete";
import { formatAmount } from "./list/format";
import { hasFilters, toListParams, useApplicationQuery } from "./list/useApplicationQuery";
import { usePageTitle } from "@/hooks/usePageTitle";

// 申請一覧。検索・絞り込み（URL に保存）→ データテーブル（並べ替え・行選択・ページ送り）→ 一括操作 / 行ごとの操作。
// データは src/api/ のダミー API から読み書きする（画面を移っても保たれ、再読み込みで元に戻る）。
// 絞り込み・並べ替え・ページ送りは API の側で行い、画面は 1 ページ分と総数だけを受け取る（DataTable の totalCount）。
// 削除は確認ダイアログを出さずにすぐ行い、トーストの「元に戻す」で取り消せるようにする（DADS: 確認ダイアログだけを安全対策にしない）。

const PAGE_SIZE = 20;


export default function ApplicationListPage() {
    usePageTitle("申請一覧");
    const navigate = useNavigate();
    const { toast } = useToast();
    const { formatDateTime } = useDisplaySettings();
    const { query, search, setFilter, clearFilters, setSort, setPage } = useApplicationQuery();

    const listQuery = applicationQueries.list(toListParams(query, PAGE_SIZE));
    const list = useQuery(listQuery);
    // 条件やページを変えて読み込んでいる間は、表を読み込み中にする（古い行を出したまま「21〜40件」などの表示だけが変わると食い違うため）。
    // ページ送りの総数だけは前の結果を使い、ページ送りの部品が消えて画面が跳ねないようにする。
    const [lastPage, setLastPage] = useState<ApplicationListPage | undefined>(list.data);
    if (list.data && list.data !== lastPage) setLastPage(list.data);
    const page = list.data;
    const rows = page?.items ?? [];
    const total = (list.data ?? lastPage)?.total ?? 0;
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [assignOpen, setAssignOpen] = useState(false);
    const assign = useMutation(assignApplications);
    // 担当者の変更ダイアログを開いたときに待たせないよう、職員の一覧を先に読み込んでおく
    useStaffOptions();

    const filtered = hasFilters(query);

    // 削除などで今のページに行がなくなったら（最後のページの最後の行を消したときなど）、最後のページへ移る
    const lastPageNumber = page ? Math.max(1, Math.ceil(page.total / PAGE_SIZE)) : 1;
    useEffect(() => {
        if (page && page.items.length === 0 && query.page > lastPageNumber) setPage(lastPageNumber);
    }, [page, query.page, lastPageNumber, setPage]);

    // 詳細画面のパンくず「申請一覧」から、この絞り込み状態に戻れるよう検索条件を渡す
    const detailState = useMemo(() => ({ listSearch: search ? `?${search}` : "" }), [search]);

    // 条件を変えたら選択を解除する（見えていない行を気付かずに一括操作しないように）
    const changeFilter = (...args: Parameters<typeof setFilter>) => {
        setSelectedIds([]);
        setFilter(...args);
    };
    const clearAll = () => {
        setSelectedIds([]);
        clearFilters();
    };

    const { remove } = useUndoableDelete();

    /** 削除する。label は「R08-001060」か「3件の申請」（トーストの「〜を削除しました」に使う）。 */
    function deleteApplications(targetIds: string[], label: string) {
        const ids = new Set(targetIds);
        return remove(targetIds, label, {
            // 通信の結果を待たずに一覧から消し（楽観的な更新）、失敗したら読み込み直して元に戻す
            beforeDelete: () => {
                setQueryData(listQuery, (prev = { items: [], total: 0 }) => ({
                    items: prev.items.filter((a) => !ids.has(a.id)),
                    total: prev.total - prev.items.filter((a) => ids.has(a.id)).length,
                }));
                setSelectedIds((prev) => prev.filter((id) => !ids.has(id)));
            },
        });
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

    // 列の定義は描画のたびに作り直さない（DataTable は列が変わると全行を並べ替え直すため、行を選ぶたびに並べ替えが走っていた）
    const columns = useMemo<DataTableColumn<Application>[]>(
        () => [
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
                accessor: (row) => row.status,
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
        ],
        [detailState, formatDateTime],
    );

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
                resultCount={page?.total}
                loading={!page && !list.error}
                onFilterChange={changeFilter}
                onClear={clearAll}
            />

            {list.error && <LoadError subject="申請の一覧" error={list.error} onRetry={list.reload} stale={!!page} />}

            {/* 表は地（canvas）に直接置かず、白い面（カード）に載せる（docs/decisions.md D-07）。
                一度も読み込めていないときは、空の表（「申請はまだありません」）と誤解されないよう表を出さない。 */}
            {!(list.error && !page) && (
                <Card>
                    <CardBody>
                        <DataTable
                            flush
                            columns={columns}
                            rows={rows}
                            totalCount={total}
                            getRowId={(row) => row.id}
                            getRowLabel={(row) => `${row.number}「${row.title}」`}
                            loading={!page}
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
                                        onClick={() => {
                                            // 選んだ行がほかのページにあっても消せるよう、id で削除する
                                            const single = selectedIds.length === 1 ? rows.find((r) => r.id === selectedIds[0]) : undefined;
                                            void deleteApplications(selectedIds, single ? single.number : `${selectedIds.length}件の申請`);
                                        }}
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
                                        { label: "編集", onSelect: () => navigate(`/applications/${row.id}/edit`, { state: detailState }) },
                                        "separator",
                                        { label: "削除", danger: true, icon: Trash2, onSelect: () => void deleteApplications([row.id], row.number) },
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
