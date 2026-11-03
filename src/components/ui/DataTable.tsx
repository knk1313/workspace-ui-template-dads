import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { Icon } from "./Icon";
import { Pagination } from "./Pagination";
import { Spinner } from "./Spinner";
import { Table, TableBody, TableCell, TableHead, TableCellLine, TableHeaderCell, TableRow, type CellAlign, type TableSize } from "./Table";

// DADS データテーブル（https://design.digital.go.jp/dads/components/table/ の「データテーブル」）。
// 静的な Table の上に、業務画面で必要になる操作を載せる。
//   - 並べ替え: ソート可能な列見出しを下線付きテキストボタン + 矢印アイコンにし、th に aria-sort を付ける。
//     クリックで 昇順 → 降順 → なし の順に切り替える（DADS: 昇順 / 降順 / なしの 3 状態）。
//   - 行選択: 先頭列のチェックボックス。ヘッダーの全選択は一部選択で indeterminate になる。選択行は key-100 の背景。
//   - 一括操作バー: 選択件数と操作を表の上に出す（role="region" で見つけやすくする）。
//   - ページ送り: Pagination と「全 N 件中 a〜b 件」の表示。
//   - 空状態 / 読み込み中（aria-busy + スケルトン行 + スピナー）。
// 1 行 1 レコードにし、セル結合をしない。行全体をリンクにせず、操作は末尾列（rowActions）に置く。

export type SortDirection = "asc" | "desc";
export type SortState = { key: string; direction: SortDirection } | null;

export type DataTableColumn<T> = {
    /** 列の識別子。sort の key にもなる。 */
    key: string;
    header: ReactNode;
    /** 表示と並べ替えに使う値。render を省略したときはこの値をそのまま表示する。 */
    accessor?: (row: T) => string | number | null | undefined;
    /** セルの描画。省略時は accessor の値。 */
    render?: (row: T) => ReactNode;
    sortable?: boolean;
    /** 数値・日付は right（等幅数字で右寄せ）。 */
    align?: CellAlign;
    /** 列幅のクラス（w-40 など）。 */
    width?: string;
    /** この列を行見出し（th scope="row"）にする。名前など行を代表する列に付ける。 */
    rowHeader?: boolean;
    /**
     * 読み込み中に表示するスケルトンの形。実際の内容に近い形にすると、読み込み後に列幅や行の高さが変わりにくい。
     *   text: 1 行の文字（既定）/ lines: 2 行（番号 + 件名など）/ chip: チップラベル / none: 何も出さない
     */
    skeleton?: "text" | "lines" | "chip" | "none";
};

export type DataTableProps<T> = {
    columns: DataTableColumn<T>[];
    rows: T[];
    getRowId: (row: T) => string;
    /** 行選択のチェックボックスの aria-label に使う行の名前。省略時は最初の列の値。 */
    getRowLabel?: (row: T) => string;
    caption?: ReactNode;
    size?: TableSize;
    striped?: boolean;
    hoverHighlight?: boolean;
    stickyHeader?: boolean;
    /** 横スクロール領域の高さなど、外側の div に付けるクラス。 */
    wrapperClassName?: string;

    /** 並べ替え（制御）。省略時は内部で状態を持つ。 */
    sort?: SortState;
    defaultSort?: SortState;
    onSortChange?: (sort: SortState) => void;

    /** 行選択を有効にする。selectedIds / onSelectionChange を渡すと制御になる。 */
    selectable?: boolean;
    selectedIds?: string[];
    defaultSelectedIds?: string[];
    onSelectionChange?: (ids: string[]) => void;
    /** 選択中に表の上に出す操作（ボタンなど）。 */
    bulkActions?: ReactNode;

    /** 1 ページの行数。省略時はページ送りしない。 */
    pageSize?: number;
    /** 読み込み中に出すスケルトンの行数。既定はページの行数（pageSize がなければ現在の行数、3〜10 行）。 */
    skeletonRows?: number;
    page?: number;
    defaultPage?: number;
    onPageChange?: (page: number) => void;
    /**
     * サーバー側でページ送り・並べ替えをする場合の総件数。
     * 渡すと rows を「現在ページの行」とみなし、内部での並べ替え・切り出しをしない。
     */
    totalCount?: number;

    /** 行ごとの操作（末尾列）。 */
    rowActions?: (row: T) => ReactNode;
    rowActionsHeader?: ReactNode;
    /** 0 件のときの表示。 */
    emptyState?: ReactNode;
    loading?: boolean;
    /**
     * Card などの余白（左右 24px）の内側に置いたとき、表だけを左右いっぱいに広げる（px-6 の余白を打ち消す）。
     * 一括操作とページ送りは余白の内側に残す。幅の狭い画面で表の列を少しでも広く使うため。
     */
    flush?: boolean;
    className?: string;
};

// 行のセルは上寄せ。選択のチェックボックスと操作ボタンは TableCellLine で包み、隣の列の 1 行目の文字とそろえる。
// 操作ボタン（44px）は枠からはみ出すが、行の高さは変えない。

// --- 読み込み中のスケルトン ---
// 文字の行（16px × 行高）の中に 16px の帯を縦中央で置き、読み込み後の文字と同じ位置・高さにする。
// 帯の幅は行ごとに少しずつ変え、同じ形が並んで単調にならないようにする。幅は % で指定し、列幅を押し広げない。
const BAR_WIDTHS = ["w-4/5", "w-3/5", "w-2/3"] as const;
const SUB_WIDTHS = ["w-full", "w-4/5", "w-11/12"] as const;

function SkeletonBlock({ className }: { className?: string }) {
    return <span data-skeleton="" className={cn("block animate-pulse rounded-4 bg-solid-gray-100 motion-reduce:animate-none", className)} />;
}

function SkeletonLine({ width, align }: { width: string; align?: CellAlign }) {
    return (
        <TableCellLine align={align}>
            <SkeletonBlock className={cn("h-4", width)} />
        </TableCellLine>
    );
}

function ColumnSkeleton({ kind, align, variant }: { kind: NonNullable<DataTableColumn<unknown>["skeleton"]>; align?: CellAlign; variant: number }) {
    if (kind === "none") return null;
    if (kind === "chip")
        return (
            <TableCellLine align={align}>
                <SkeletonBlock className="h-8 w-16 rounded-8" />
            </TableCellLine>
        );
    if (kind === "lines")
        return (
            <span className="block">
                <SkeletonLine width="w-28 max-w-full" />
                <SkeletonLine width={SUB_WIDTHS[variant]} />
            </span>
        );
    return <SkeletonLine width={BAR_WIDTHS[variant]} align={align} />;
}

const SORT_ICON: Record<SortDirection | "none", typeof ArrowUp> = { asc: ArrowUp, desc: ArrowDown, none: ArrowUpDown };
const ARIA_SORT: Record<SortDirection, "ascending" | "descending"> = { asc: "ascending", desc: "descending" };

function compareValues(a: string | number | null | undefined, b: string | number | null | undefined): number {
    // 空値は常に末尾
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    if (typeof a === "number" && typeof b === "number") return a - b;
    return String(a).localeCompare(String(b), "ja", { numeric: true });
}

/** 内部状態と制御（props）を切り替える小さなヘルパー。 */
function useControllable<V>(controlled: V | undefined, defaultValue: V, onChange?: (v: V) => void): [V, (v: V) => void] {
    const [inner, setInner] = useState(defaultValue);
    const value = controlled !== undefined ? controlled : inner;
    const set = (v: V) => {
        if (controlled === undefined) setInner(v);
        onChange?.(v);
    };
    return [value, set];
}

export function DataTable<T>({
    columns,
    rows,
    getRowId,
    getRowLabel,
    caption,
    size = "default",
    striped = false,
    hoverHighlight = true,
    stickyHeader = false,
    wrapperClassName,
    sort: sortProp,
    defaultSort = null,
    onSortChange,
    selectable = false,
    selectedIds: selectedProp,
    defaultSelectedIds = [],
    onSelectionChange,
    bulkActions,
    pageSize,
    skeletonRows: skeletonRowsProp,
    page: pageProp,
    defaultPage = 1,
    onPageChange,
    totalCount,
    rowActions,
    rowActionsHeader = "操作",
    emptyState,
    loading = false,
    flush = false,
    className,
}: DataTableProps<T>) {
    const [sort, setSort] = useControllable<SortState>(sortProp, defaultSort, onSortChange);
    const [selectedIds, setSelectedIds] = useControllable<string[]>(selectedProp, defaultSelectedIds, onSelectionChange);
    const [page, setPage] = useControllable<number>(pageProp, defaultPage, onPageChange);

    const serverSide = totalCount !== undefined;

    // 並べ替え（クライアント側のみ）
    const sortedRows = useMemo(() => {
        if (serverSide || !sort) return rows;
        const column = columns.find((c) => c.key === sort.key);
        if (!column?.accessor) return rows;
        const accessor = column.accessor;
        const sign = sort.direction === "asc" ? 1 : -1;
        // 安定ソートにするため index を保持する
        return rows
            .map((row, index) => ({ row, index }))
            .sort((a, b) => compareValues(accessor(a.row), accessor(b.row)) * sign || a.index - b.index)
            .map(({ row }) => row);
    }, [rows, columns, sort, serverSide]);

    // ページ送り
    const total = serverSide ? totalCount : sortedRows.length;
    const totalPages = pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1;
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const visibleRows = useMemo(() => {
        if (serverSide || !pageSize) return sortedRows;
        const start = (currentPage - 1) * pageSize;
        return sortedRows.slice(start, start + pageSize);
    }, [sortedRows, serverSide, pageSize, currentPage]);

    const rangeStart = total === 0 ? 0 : (currentPage - 1) * (pageSize ?? total) + 1;
    const rangeEnd = pageSize ? Math.min(total, currentPage * pageSize) : total;

    // 選択
    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
    const visibleIds = visibleRows.map(getRowId);
    const selectedVisibleCount = visibleIds.filter((rowId) => selectedSet.has(rowId)).length;
    const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
    const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

    const toggleAll = () => {
        if (allVisibleSelected) {
            setSelectedIds(selectedIds.filter((rowId) => !visibleIds.includes(rowId)));
        } else {
            setSelectedIds([...selectedIds, ...visibleIds.filter((rowId) => !selectedSet.has(rowId))]);
        }
    };
    const toggleRow = (rowId: string) => {
        setSelectedIds(selectedSet.has(rowId) ? selectedIds.filter((v) => v !== rowId) : [...selectedIds, rowId]);
    };

    const handleSort = (key: string) => {
        let next: SortState;
        if (!sort || sort.key !== key) next = { key, direction: "asc" };
        else if (sort.direction === "asc") next = { key, direction: "desc" };
        else next = null;
        setSort(next);
        // 並び順が変わると「n ページ目」の意味が変わるので先頭に戻す
        if (!serverSide && currentPage !== 1) setPage(1);
    };

    const resolveLabel = (row: T): string => {
        if (getRowLabel) return getRowLabel(row);
        const first = columns[0]?.accessor?.(row);
        return first != null ? String(first) : getRowId(row);
    };

    const columnCount = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);
    const skeletonRows = skeletonRowsProp ?? pageSize ?? Math.min(Math.max(visibleRows.length, 3), 10);

    return (
        <div className={cn("flex flex-col gap-4", className)} aria-busy={loading || undefined}>
            {selectable && selectedIds.length > 0 && (
                <div role="region" aria-label="選択中の項目の操作" className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 rounded-8 bg-primary-surface px-4 py-2 text-16 text-text", flush && "mx-6")}>
                    <p className="m-0 font-bold nums">{selectedIds.length}件選択中</p>
                    <Button variant="text" size="sm" onClick={() => setSelectedIds([])}>
                        選択を解除
                    </Button>
                    {bulkActions && <div className="flex flex-wrap items-center gap-2 md:ml-auto">{bulkActions}</div>}
                </div>
            )}

            <Table
                size={size}
                striped={striped}
                hoverHighlight={hoverHighlight}
                selectable={selectable}
                stickyHeader={stickyHeader}
                caption={caption}
                wrapperClassName={cn(flush && "-mx-6", wrapperClassName)}
                className="min-w-table-min"
            >
                <TableHead>
                    <TableRow>
                        {selectable && (
                            <TableHeaderCell className="w-10 px-2!">
                                <TableCellLine>
                                    <Checkbox
                                        size="sm"
                                        aria-label="すべての行を選択"
                                        checked={allVisibleSelected}
                                        indeterminate={someVisibleSelected}
                                        onChange={toggleAll}
                                    />
                                </TableCellLine>
                            </TableHeaderCell>
                        )}
                        {columns.map((column) => {
                            const active = sort && sort.key === column.key ? sort.direction : null;
                            return (
                                <TableHeaderCell
                                    key={column.key}
                                    align={column.align}
                                    aria-sort={column.sortable ? (active ? ARIA_SORT[active] : "none") : undefined}
                                    className={cn(column.width, column.sortable && (size === "dense" ? "py-0" : "py-3"))}
                                >
                                    {column.sortable ? (
                                        <button
                                            type="button"
                                            onClick={() => handleSort(column.key)}
                                            className={cn(
                                                "inline-flex max-w-full items-start gap-0.5 rounded-4 border-0 bg-transparent p-0 py-2 text-left font-bold text-inherit underline decoration-1 underline-offset-3 hover:underline-thick focus-visible:focus-ring-fill",
                                                size === "dense" && "py-2.75",
                                                column.align === "right" && "flex-row-reverse text-right",
                                            )}
                                        >
                                            <span className="whitespace-nowrap">{column.header}</span>
                                            <span className="flex h-lh shrink-0 items-center">
                                                <Icon icon={SORT_ICON[active ?? "none"]} size="md" className={active ? "text-text-strong" : "text-text-muted"} />
                                            </span>
                                            <span className="sr-only">{active === "asc" ? "（昇順）" : active === "desc" ? "（降順）" : "（並べ替え）"}</span>
                                        </button>
                                    ) : (
                                        column.header
                                    )}
                                </TableHeaderCell>
                            );
                        })}
                        {rowActions && <TableHeaderCell className="w-px whitespace-nowrap px-2!">{rowActionsHeader}</TableHeaderCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <>
                            <TableRow>
                                <TableCell colSpan={columnCount} className="py-3 text-text-muted">
                                    <span className="inline-flex items-center gap-2">
                                        <Spinner size="md" label="読み込み中" />
                                        <span aria-hidden="true">読み込み中</span>
                                    </span>
                                </TableCell>
                            </TableRow>
                            {Array.from({ length: skeletonRows }, (_, i) => (
                                <TableRow key={i} aria-hidden="true">
                                    {selectable && (
                                        <TableCell className="w-10 px-2!">
                                            <TableCellLine>
                                                <SkeletonBlock className="size-6" />
                                            </TableCellLine>
                                        </TableCell>
                                    )}
                                    {columns.map((column, j) => (
                                        <TableCell key={column.key} align={column.align} className={column.width}>
                                            <ColumnSkeleton kind={column.skeleton ?? "text"} align={column.align} variant={(i + j) % 3} />
                                        </TableCell>
                                    ))}
                                    {rowActions && (
                                        <TableCell className="px-2!">
                                            <TableCellLine align="right">
                                                <span className="flex size-target items-center justify-center">
                                                    <SkeletonBlock className="size-6 rounded-full" />
                                                </span>
                                            </TableCellLine>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </>
                    ) : visibleRows.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={columnCount} className="py-10 text-center text-text-muted">
                                {emptyState ?? "該当するデータがありません"}
                            </TableCell>
                        </TableRow>
                    ) : (
                        visibleRows.map((row) => {
                            const rowId = getRowId(row);
                            const selected = selectedSet.has(rowId);
                            return (
                                <TableRow key={rowId} selected={selected}>
                                    {selectable && (
                                        <TableCell className="w-10 px-2!">
                                            <TableCellLine>
                                                <Checkbox size="sm" aria-label={`${resolveLabel(row)}を選択`} checked={selected} onChange={() => toggleRow(rowId)} />
                                            </TableCellLine>
                                        </TableCell>
                                    )}
                                    {columns.map((column) => {
                                        const content = column.render ? column.render(row) : column.accessor?.(row);
                                        return column.rowHeader ? (
                                            <TableHeaderCell key={column.key} scope="row" variant="plain" align={column.align} className={column.width}>
                                                {content}
                                            </TableHeaderCell>
                                        ) : (
                                            <TableCell key={column.key} align={column.align} className={column.width}>
                                                {content}
                                            </TableCell>
                                        );
                                    })}
                                    {rowActions && (
                                        <TableCell className="whitespace-nowrap px-2!">
                                            <TableCellLine align="right">{rowActions(row)}</TableCellLine>
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>

            {pageSize && (
                <div className={cn("flex flex-wrap items-center justify-between gap-4", flush && "px-6")}>
                    <p className="m-0 text-16 text-text-muted nums">
                        全{total}件中{rangeStart}〜{rangeEnd}件
                    </p>
                    {totalPages > 1 && <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} size="md" />}
                </div>
            )}
        </div>
    );
}
