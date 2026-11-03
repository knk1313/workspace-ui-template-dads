import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { SeriesSymbol, type SeriesSymbolProps } from "./ChartPatterns";
import { formatNumber, type ChartDatum } from "./chartUtils";

// グラフの共通の枠（ダッシュボードデザインの実践ガイドブック）。
//   - タイトルは「内容 + データ種別」（例: 申請件数の月次推移）。単位をタイトルの横に出す。
//   - 凡例はグラフの直上に置き、グラフと分離しない。記号は色 + 形 / 模様（色だけに依存しない）。
//   - 出典・注記・更新日（データを定義するメタ情報）を下に書く。
//   - 「データテーブルを表示」で同じデータの表を出す（スクリーンリーダー・キーボード利用者の代替手段）。
// <figure> + <figcaption> を使い、グラフ本体の SVG は各グラフ部品が role="img" + aria-label を付ける。

export type ChartHeight = "md" | "sm";

const HEIGHT: Record<ChartHeight, string> = {
    md: "h-chart", // 256px
    sm: "h-chart-sm", // 160px
};

export type LegendItem = Omit<SeriesSymbolProps, "className"> & {
    name: string;
};

/** 凡例（グラフの上部）。記号は装飾で、系列名をテキストで出す。 */
export function ChartLegend({ items, className }: { items: readonly LegendItem[]; className?: string }) {
    if (items.length === 0) return null;
    return (
        <ul className={cn("flex flex-wrap gap-x-4 gap-y-1 text-14 text-text", className)} aria-label="凡例">
            {items.map(({ name, ...symbol }) => (
                <li key={name} className="flex items-center gap-1.5">
                    <SeriesSymbol {...symbol} className="shrink-0" />
                    <span>{name}</span>
                </li>
            ))}
        </ul>
    );
}

export type ChartDataTableColumn = {
    key: string;
    label: string;
    /** 値の整形。既定は桁区切り + unit。 */
    format?: (value: unknown, row: ChartDatum) => ReactNode;
};

export type ChartDataTableProps = {
    /** 表のキャプション（グラフのタイトルと同じにする）。 */
    caption: string;
    /** 行見出しになる列（X 軸・カテゴリー）。 */
    rowHeader: { key: string; label: string };
    columns: readonly ChartDataTableColumn[];
    rows: readonly ChartDatum[];
    unit?: string;
    className?: string;
};

/** グラフと同じデータの表。数値列は右寄せ + 等幅数字。 */
export function ChartDataTable({ caption, rowHeader, columns, rows, unit, className }: ChartDataTableProps) {
    return (
        <div className={cn("overflow-x-auto", className)}>
            <table className="w-full border-collapse text-14 text-text">
                <caption className="py-2 text-left font-bold">
                    {caption}
                    {unit && <span className="ml-2 font-normal text-text-muted">（単位：{unit}）</span>}
                </caption>
                <thead>
                    <tr className="border-b-2 border-border-emphasis bg-surface-strong">
                        <th scope="col" className="px-3 py-2 text-left font-bold">
                            {rowHeader.label}
                        </th>
                        {columns.map((c) => (
                            <th key={c.key} scope="col" className="px-3 py-2 text-right font-bold">
                                {c.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={`${String(row[rowHeader.key])}-${i}`} className="border-b border-border">
                            <th scope="row" className="px-3 py-2 text-left font-normal">
                                {String(row[rowHeader.key] ?? "")}
                            </th>
                            {columns.map((c) => (
                                <td key={c.key} className="px-3 py-2 text-right nums">
                                    {c.format ? c.format(row[c.key], row) : formatNumber(row[c.key], unit)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export type ChartFrameProps = {
    /** タイトル。「内容 + データ種別」（例: 申請件数の月次推移）。 */
    title: string;
    /** タイトルの見出しレベル。既定 h3。 */
    as?: "h2" | "h3" | "h4";
    /** 単位（件、% など）。タイトルの横に表示する。 */
    unit?: string;
    /** グラフの読み方などの説明。 */
    description?: ReactNode;
    /** 出典。 */
    source?: ReactNode;
    /** 注記（集計時点、除外条件など）。 */
    note?: ReactNode;
    /** 更新日（例: 2026-10-31）。 */
    updatedAt?: string;
    /** 凡例。空なら表示しない。 */
    legend?: readonly LegendItem[];
    /** グラフ本体。 */
    children: ReactNode;
    /** データテーブル（ChartDataTable）。渡すとトグルで表示できる。 */
    table?: ReactNode;
    /** グラフの高さ。md = h-chart（256px）、sm = h-chart-sm（160px）。 */
    height?: ChartHeight;
    /** 右上の操作（期間の切り替えなど）。 */
    actions?: ReactNode;
    /** 初期状態でデータテーブルを開く。 */
    defaultTableOpen?: boolean;
    className?: string;
};

export function ChartFrame({
    title,
    as: Heading = "h3",
    unit,
    description,
    source,
    note,
    updatedAt,
    legend = [],
    children,
    table,
    height = "md",
    actions,
    defaultTableOpen = false,
    className,
}: ChartFrameProps) {
    const tableId = useId();
    const [tableOpen, setTableOpen] = useState(defaultTableOpen);
    const hasMeta = Boolean(source || note || updatedAt);
    return (
        <figure className={cn("flex min-w-0 flex-col gap-2", className)}>
            <figcaption className="flex flex-col gap-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <Heading className="text-std-16B-170">
                        {title}
                        {unit && <span className="ml-2 font-normal text-text-muted">（単位：{unit}）</span>}
                    </Heading>
                    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
                </div>
                {description && <p className="text-14 text-text-muted">{description}</p>}
            </figcaption>
            <ChartLegend items={legend} />
            {/* 軸ラベルなど SVG 内の文字は 14px（補足扱い）。 */}
            <div className={cn("w-full text-14", HEIGHT[height])}>{children}</div>
            {hasMeta && (
                <dl className="flex flex-wrap gap-x-4 gap-y-0.5 text-14 text-text-muted">
                    {source && (
                        <div className="flex gap-1">
                            <dt className="shrink-0 whitespace-nowrap">出典：</dt>
                            <dd>{source}</dd>
                        </div>
                    )}
                    {note && (
                        <div className="flex gap-1">
                            <dt className="shrink-0 whitespace-nowrap">注記：</dt>
                            <dd>{note}</dd>
                        </div>
                    )}
                    {updatedAt && (
                        <div className="flex gap-1">
                            <dt className="shrink-0 whitespace-nowrap">更新日：</dt>
                            <dd>{updatedAt}</dd>
                        </div>
                    )}
                </dl>
            )}
            {table && (
                <div className="flex flex-col items-start gap-1">
                    <Button variant="text" size="sm" aria-expanded={tableOpen} aria-controls={tableId} onClick={() => setTableOpen((v) => !v)}>
                        {tableOpen ? "数値の表を閉じる" : "数値の表を表示"}
                    </Button>
                    <div id={tableId} className="w-full" hidden={!tableOpen}>
                        {tableOpen && table}
                    </div>
                </div>
            )}
        </figure>
    );
}

/** 各グラフ部品が ChartFrame に渡す共通 Props（グラフ本体・凡例・表は部品が作る）。 */
export type ChartFrameBaseProps = Omit<ChartFrameProps, "children" | "legend" | "table">;

/** テストなど固定サイズで描くときの寸法。省略時は ResponsiveContainer（親の 100%）。 */
export type ChartSize = { width: number; height: number };
