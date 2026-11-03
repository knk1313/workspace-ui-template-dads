import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, SearchX, Trash2, UserRoundPen } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { EmptyState } from "@/components/ui/EmptyState";
import { Link } from "@/components/ui/Link";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/components/ui/Toast";
import { useDisplaySettings } from "@/context/DisplaySettings";
import { APPLICATIONS, CATEGORY_LABELS, STATUS_LABELS, type Application } from "@/mocks/applications";
import { ApplicationFilters } from "./list/ApplicationFilters";
import { ApplicationStatusChip } from "./list/ApplicationStatusChip";
import { AssignDialog } from "./list/AssignDialog";
import { formatAmount } from "./list/format";
import { filterApplications, hasFilters, useApplicationQuery } from "./list/useApplicationQuery";

// 申請一覧。検索・絞り込み（URL に保存）→ データテーブル（並べ替え・行選択・ページ送り）→ 一括操作 / 行ごとの操作。
// データは画面内の状態として持ち、削除や担当者の変更はこの画面の中だけに反映する（再読み込みで元に戻る）。

const PAGE_SIZE = 20;
/** 「読み込み中」の表示例を見せる時間。実際の API に置き換えるときは取得中フラグに差し替える。 */
const DEMO_LOADING_MS = 600;

const STATUS_ORDER = Object.keys(STATUS_LABELS);

export default function ApplicationListPage() {
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const { toast } = useToast();
    const { formatDateTime } = useDisplaySettings();
    const { query, search, setFilter, clearFilters, setSort, setPage } = useApplicationQuery();

    const [applications, setApplications] = useState<Application[]>(() => [...APPLICATIONS]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [assignOpen, setAssignOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), DEMO_LOADING_MS);
        return () => clearTimeout(timer);
    }, []);

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
        const single = targets.length === 1;
        const ok = await confirm({
            title: single ? `${targets[0].number} を削除しますか` : `${targets.length} 件の申請を削除しますか`,
            message: single ? `「${targets[0].title}」を削除します。この操作は取り消せません。` : "選択した申請をすべて削除します。この操作は取り消せません。",
            confirmLabel: "削除する",
            tone: "error",
        });
        if (!ok) return;
        const ids = new Set(targets.map((t) => t.id));
        setApplications((prev) => prev.filter((a) => !ids.has(a.id)));
        setSelectedIds((prev) => prev.filter((id) => !ids.has(id)));
        toast({ type: "success", title: single ? `${targets[0].number} を削除しました` : `${targets.length} 件の申請を削除しました` });
    }

    function assignSelected(assignee: string) {
        const ids = new Set(selectedIds);
        setApplications((prev) => prev.map((a) => (ids.has(a.id) ? { ...a, assignee } : a)));
        setAssignOpen(false);
        toast({ type: "success", title: `${ids.size} 件の担当者を ${assignee} に変更しました` });
    }

    const columns: DataTableColumn<Application>[] = [
        {
            key: "number",
            header: "受付番号",
            accessor: (row) => row.number,
            render: (row) => (
                <Link to={`/applications/${row.id}`} state={detailState} className="whitespace-nowrap">
                    {row.number}
                </Link>
            ),
            sortable: true,
            rowHeader: true,
        },
        {
            key: "title",
            header: "件名",
            accessor: (row) => row.title,
            // 他の列を折り返さない分、件名が 1 文字幅まで縮まないよう最小幅を持たせる
            render: (row) => <span className="block min-w-48">{row.title}</span>,
            sortable: true,
        },
        { key: "applicant", header: "申請者", accessor: (row) => row.applicant, sortable: true, width: "whitespace-nowrap" },
        { key: "category", header: "種別", accessor: (row) => CATEGORY_LABELS[row.category], sortable: true, width: "whitespace-nowrap" },
        {
            key: "status",
            header: "状態",
            // 表示名の五十音ではなく、手続きの進む順（下書き → 受付済み → … ）で並べる
            accessor: (row) => STATUS_ORDER.indexOf(row.status),
            render: (row) => <ApplicationStatusChip status={row.status} />,
            sortable: true,
            width: "whitespace-nowrap",
        },
        {
            key: "amount",
            header: "申請額",
            accessor: (row) => row.amount,
            render: (row) => formatAmount(row.amount) ?? <span className="text-text-muted">なし</span>,
            sortable: true,
            align: "right",
            width: "whitespace-nowrap",
        },
        { key: "assignee", header: "担当者", accessor: (row) => row.assignee, sortable: true, width: "whitespace-nowrap" },
        {
            key: "updatedAt",
            header: "更新日時",
            accessor: (row) => row.updatedAt,
            render: (row) => <time dateTime={row.updatedAt}>{formatDateTime(row.updatedAt)}</time>,
            sortable: true,
            align: "right",
            width: "whitespace-nowrap",
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

            <ApplicationFilters query={query} resultCount={rows.length} onFilterChange={changeFilter} onClear={clearAll} />

            {/* 表は地（canvas）に直接置かず、白い面（カード）に載せる（docs/decisions.md D-07） */}
            <Card>
                <CardBody>
                    <DataTable
                        columns={columns}
                        rows={rows}
                        getRowId={(row) => row.id}
                        getRowLabel={(row) => `${row.number} ${row.title}`}
                        loading={loading}
                        stickyHeader
                        // 固定ヘッダーを効かせるため、md 以上では表の領域に高さの上限を設けて中でスクロールさせる
                        wrapperClassName="md:max-h-screen"
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
                                label={`${row.number} の操作`}
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
                                    title="条件に一致する申請はありません"
                                    description="キーワードや絞り込み条件を変えて、もう一度お試しください。"
                                    action={
                                        <Button variant="outline" onClick={clearAll}>
                                            条件をクリア
                                        </Button>
                                    }
                                />
                            ) : (
                                <EmptyState
                                    title="申請はまだありません"
                                    description="新しい申請を登録すると、ここに表示されます。"
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

            {assignOpen && <AssignDialog count={selectedIds.length} onClose={() => setAssignOpen(false)} onSubmit={assignSelected} />}
        </div>
    );
}
