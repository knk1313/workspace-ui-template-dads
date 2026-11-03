import { createContext, useContext, type HTMLAttributes, type ReactNode, type TdHTMLAttributes, type ThHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

// DADS テーブル（https://design.digital.go.jp/dads/components/table/、HTML 版 table.css）の静的な表の部品群。
//   Table（size: default = セル padding 20px 16px / 行高 1.7、dense = 12px 16px / 行高 1.3）
//   TableHead / TableBody / TableRow / TableHeaderCell / TableCell
// ヘッダーセルは太字・背景 solid-gray-100・文字 solid-gray-900・下線 black でデータセルと明確に区切る。
// 罫線は solid-gray-420。ストライプ・ホバー・行選択を含む表は背景とのコントラスト 3:1 を保つため solid-gray-500 にする。
// セルは縦上寄せ。数値・日付は align="right"（等幅数字）。
// 横に広い表は <div class="overflow-x-auto"> の領域内で横スクロールし、モバイルでは続きがあることを示すシャドーを出す。
// セル結合は避け、行全体をリンクにしない（DADS の規定）。
// 並べ替え・行選択・ページ送りなど操作を伴う表は DataTable を使う。

export type TableSize = "default" | "dense";

type TableContextValue = {
    size: TableSize;
    /** 罫線の色クラス。ストライプ・ホバー・選択を含む表は濃くする。 */
    borderColor: string;
    striped: boolean;
    hoverHighlight: boolean;
    stickyHeader: boolean;
};

const TableContext = createContext<TableContextValue>({
    size: "default",
    borderColor: "border-border",
    striped: false,
    hoverHighlight: false,
    stickyHeader: false,
});

const SectionContext = createContext<"head" | "body" | "foot">("body");

const CELL_PADDING: Record<TableSize, string> = {
    default: "px-4 py-5",
    dense: "px-4 py-3",
};

export type TableProps = Omit<HTMLAttributes<HTMLTableElement>, "children"> & {
    children: ReactNode;
    size?: TableSize;
    /** 偶数行に薄い背景を付ける（大きな表の視認性向上）。 */
    striped?: boolean;
    /** マウスカーソルが乗った行をハイライトする。 */
    hoverHighlight?: boolean;
    /** 行選択（チェックボックス）を含む表。罫線を濃くする。 */
    selectable?: boolean;
    /** 表のタイトル（<caption>）。見出しの代わりにはしない。 */
    caption?: ReactNode;
    /** 親の幅いっぱいに広げる。既定は true（管理画面では領域いっぱいに使うことが多い）。 */
    fullWidth?: boolean;
    /** thead を領域の上端に固定する（横スクロール領域が縦にもスクロールするとき）。 */
    stickyHeader?: boolean;
    /** 横スクロールする外側の div に付けるクラス（高さの制限など）。 */
    wrapperClassName?: string;
};

export function Table({
    children,
    size = "default",
    striped = false,
    hoverHighlight = false,
    selectable = false,
    caption,
    fullWidth = true,
    stickyHeader = false,
    wrapperClassName,
    className,
    ...props
}: TableProps) {
    const borderColor = striped || hoverHighlight || selectable ? "border-border-table" : "border-border";
    return (
        <TableContext.Provider value={{ size, borderColor, striped, hoverHighlight, stickyHeader }}>
            {/* 領域内で横スクロールする。モバイル幅では右端にシャドーを出して続きがあることを示す。 */}
            <div className={cn("w-full overflow-x-auto max-md:scroll-shadow-x", wrapperClassName)}>
                <table
                    className={cn(
                        // sticky ヘッダーで罫線が消えないよう border-separate にし、罫線は各セルの下線で描く
                        "m-0 border-separate border-spacing-0 text-left text-16 tracking-2 text-text",
                        size === "dense" ? "leading-130" : "leading-170",
                        fullWidth && "w-full",
                        className,
                    )}
                    {...props}
                >
                    {caption && <caption className="mb-4 text-left text-17 font-bold text-text">{caption}</caption>}
                    {children}
                </table>
            </div>
        </TableContext.Provider>
    );
}

export type TableSectionProps = HTMLAttributes<HTMLTableSectionElement> & { children: ReactNode };

export function TableHead({ className, children, ...props }: TableSectionProps) {
    const { stickyHeader } = useContext(TableContext);
    return (
        <SectionContext.Provider value="head">
            <thead className={cn(stickyHeader && "sticky top-0 z-10", className)} {...props}>
                {children}
            </thead>
        </SectionContext.Provider>
    );
}

export function TableBody({ className, children, ...props }: TableSectionProps) {
    return (
        <SectionContext.Provider value="body">
            <tbody className={className} {...props}>
                {children}
            </tbody>
        </SectionContext.Provider>
    );
}

export type TableRowProps = HTMLAttributes<HTMLTableRowElement> & {
    children: ReactNode;
    /** 選択された行（key-100 の背景）。選択状態そのものは行内のチェックボックスが伝える（table の tr に aria-selected は使えない）。 */
    selected?: boolean;
};

export function TableRow({ className, selected = false, children, ...props }: TableRowProps) {
    const { striped, hoverHighlight } = useContext(TableContext);
    const section = useContext(SectionContext);
    const inBody = section === "body";
    return (
        <tr
            className={cn(
                inBody && striped && "even:bg-surface-muted",
                inBody && hoverHighlight && "hover:bg-surface-hover",
                // 選択は hover やストライプより優先して見せる
                inBody && selected && "bg-surface-selected even:bg-surface-selected hover:bg-surface-selected",
                className,
            )}
            {...props}
        >
            {children}
        </tr>
    );
}

export type CellAlign = "left" | "right";

export type TableHeaderCellProps = Omit<ThHTMLAttributes<HTMLTableCellElement>, "align"> & {
    children?: ReactNode;
    /** 列見出しは col、行見出しは row。 */
    scope?: "col" | "row";
    /** 数値・日付の列は right（等幅数字）。 */
    align?: CellAlign;
    /**
     * plain はデータセルと同じ装飾（太字のみ）。データテーブルで名前の列を行見出しにするときに使う
     * （DADS の行見出しは背景 solid-gray-100 + 右線 black だが、レコードの一覧では重すぎるため）。
     */
    variant?: "default" | "plain";
};

export function TableHeaderCell({ className, scope = "col", align = "left", variant = "default", children, ...props }: TableHeaderCellProps) {
    const { size, borderColor } = useContext(TableContext);
    return (
        <th
            scope={scope}
            className={cn(
                "align-top font-bold",
                CELL_PADDING[size],
                variant === "plain"
                    ? cn("border-b text-text", borderColor)
                    : cn(
                          "bg-surface-strong text-text-strong",
                          // 列見出しは下線、行見出しは右線を黒にしてデータセルと区切る
                          scope === "col" ? "border-b border-border-emphasis" : cn("border-b border-r border-r-border-emphasis", borderColor),
                      ),
                align === "right" ? "text-right nums" : "text-left",
                className,
            )}
            {...props}
        >
            {children}
        </th>
    );
}

export type TableCellProps = Omit<TdHTMLAttributes<HTMLTableCellElement>, "align"> & {
    children?: ReactNode;
    align?: CellAlign;
};

export function TableCell({ className, align = "left", children, ...props }: TableCellProps) {
    const { size, borderColor } = useContext(TableContext);
    return (
        <td className={cn("border-b align-top", borderColor, CELL_PADDING[size], align === "right" ? "text-right nums" : "text-left", className)} {...props}>
            {children}
        </td>
    );
}

/** Table の設定（サイズ・罫線色）を子から参照する。DataTable などの拡張用。 */
export function useTable(): TableContextValue {
    return useContext(TableContext);
}
