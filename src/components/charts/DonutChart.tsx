import { useId, useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, type PieLabelRenderProps } from "recharts";
import { ChartDataTable, ChartFrame, type ChartFrameBaseProps, type ChartSize, type LegendItem } from "./ChartFrame";
import { ChartPatterns } from "./ChartPatterns";
import { ChartTooltip } from "./ChartTooltip";
import { CHART_COLORS, MAX_SERIES, buildShareSummary, formatNumber, formatPercent, joinNameValue, seriesFill, seriesStyle, toSafeId, type ChartDatum } from "./chartUtils";

// ドーナツグラフ（構成比）。総量が明らかで、コンパクトに伝えたい場合だけ使う。
// 多くの場合は棒グラフの方が正確に比較できる（ガイドブック）。
//   - 中央に合計と単位、各扇の外側に「名前 割合%」のラベル（色だけに依存しない）。
//   - 扇は最大 5 + 「その他」。maxSlices を超えた分は「その他」にまとめる。

export type DonutDatum = { name: string; value: number };

export type DonutChartProps = ChartFrameBaseProps & {
    data: readonly DonutDatum[];
    /** 中央の合計の下に出す文言（例: 合計）。 */
    centerLabel?: string;
    /** 扇の最大数（既定 5）。超えた分は「その他」にまとめる。 */
    maxSlices?: number;
    /** 「その他」の表示名。 */
    otherLabel?: string;
    /** 内径（% か px）。既定 "60%"。 */
    innerRadius?: number | string;
    /** 2 系列目以降に模様を重ねる（既定 true）。 */
    patterns?: boolean;
    /** 扇のラベルを表示する（既定 true）。狭い場所では false にし、凡例とデータテーブルで補う。 */
    showLabels?: boolean;
    palette?: readonly string[];
    summary?: string;
    size?: ChartSize;
};

/** maxSlices を超えた分を「その他」にまとめる。 */
export function groupSlices(data: readonly DonutDatum[], maxSlices: number, otherLabel: string): DonutDatum[] {
    const limit = Math.max(1, Math.min(maxSlices, MAX_SERIES));
    if (data.length <= limit) return [...data];
    // 「その他」を 1 枠使うので、limit - 1 個を残す。
    const head = data.slice(0, limit - 1);
    const rest = data.slice(limit - 1).reduce((sum, d) => sum + d.value, 0);
    return [...head, { name: otherLabel, value: rest }];
}

/** 引き出し線の寸法（px）。扇から離す幅、放射状の長さ、水平の長さ、文字との間。 */
const LABEL_LINE = { gap: 2, radial: 14, horizontal: 12, textGap: 4 };

export function DonutChart({
    data,
    centerLabel = "合計",
    maxSlices = MAX_SERIES,
    otherLabel = "その他",
    innerRadius = "60%",
    patterns = true,
    showLabels = true,
    palette,
    summary,
    size,
    unit,
    title,
    ...frame
}: DonutChartProps) {
    const idPrefix = toSafeId(useId());
    const slices = useMemo(() => groupSlices(data, maxSlices, otherLabel), [data, maxSlices, otherLabel]);
    const total = slices.reduce((sum, d) => sum + d.value, 0);
    const label = summary ?? buildShareSummary(title, slices, unit);
    const legend: LegendItem[] = slices.map((d, i) => {
        const style = seriesStyle(i, palette);
        return { name: d.name, kind: "fill", color: style.color, pattern: style.pattern, patterns };
    });
    const rows: ChartDatum[] = slices.map((d) => ({ name: d.name, value: d.value, share: total > 0 ? d.value / total : 0 }));

    // ラベルと引き出し線。扇の外側から放射状に出し、水平に折ってから、線の端の高さの中央に文字を置く
    // （Recharts の既定の斜めの線は文字の角で終わり、文字から浮いて見えるため）。
    const renderLabel = (p: PieLabelRenderProps) => {
        const num = (v: unknown) => (typeof v === "number" ? v : 0);
        const cx = num(p.cx);
        const cy = num(p.cy);
        const outer = num(p.outerRadius);
        const angle = (-num(p.midAngle) * Math.PI) / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const side = cos >= 0 ? 1 : -1;
        const start = { x: cx + (outer + LABEL_LINE.gap) * cos, y: cy + (outer + LABEL_LINE.gap) * sin };
        const bend = { x: cx + (outer + LABEL_LINE.radial) * cos, y: cy + (outer + LABEL_LINE.radial) * sin };
        const end = { x: bend.x + side * LABEL_LINE.horizontal, y: bend.y };
        const pct = typeof p.percent === "number" ? formatPercent(p.percent) : "";
        return (
            <g>
                <polyline points={`${start.x},${start.y} ${bend.x},${bend.y} ${end.x},${end.y}`} fill="none" stroke={CHART_COLORS.axis} strokeWidth={1.5} />
                <text x={end.x + side * LABEL_LINE.textGap} y={end.y} textAnchor={side > 0 ? "start" : "end"} dominantBaseline="central" fill={CHART_COLORS.text}>
                    {joinNameValue(String(p.name ?? ""), pct)}
                </text>
            </g>
        );
    };

    const chart = (
        <PieChart width={size?.width} height={size?.height} role="img" aria-label={label} accessibilityLayer={false} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <ChartPatterns idPrefix={idPrefix} count={slices.length} palette={palette} />
            <Pie
                data={slices}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={showLabels ? "70%" : "90%"}
                stroke={CHART_COLORS.surface}
                strokeWidth={2}
                isAnimationActive={false}
                label={showLabels ? renderLabel : false}
                labelLine={false}
            >
                {slices.map((d, i) => (
                    <Cell key={d.name} fill={seriesFill(idPrefix, i, patterns, palette)} data-series={d.name} />
                ))}
            </Pie>
            <Tooltip content={(props) => <ChartTooltip {...props} unit={unit} formatValue={(v) => `${formatNumber(v, unit)}（${total > 0 && typeof v === "number" ? formatPercent(v / total) : "—"}）`} />} />
        </PieChart>
    );

    return (
        <ChartFrame
            title={title}
            unit={unit}
            legend={legend}
            table={
                <ChartDataTable
                    caption={title}
                    rowHeader={{ key: "name", label: "項目" }}
                    columns={[
                        { key: "value", label: "値" },
                        { key: "share", label: "構成比", format: (v) => (typeof v === "number" ? formatPercent(v) : "—") },
                    ]}
                    rows={rows}
                    unit={unit}
                />
            }
            {...frame}
        >
            {/* 中央の合計は HTML で重ねる（aria-label に合計が含まれるので装飾扱い）。 */}
            <div className="relative h-full w-full" style={size ? { width: size.width, height: size.height } : undefined}>
                {size ? chart : <ResponsiveContainer width="100%" height="100%">{chart}</ResponsiveContainer>}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center" aria-hidden="true">
                    <span className="text-std-20B-150 nums">{formatNumber(total, unit)}</span>
                    {centerLabel && <span className="text-14 text-text-muted">{centerLabel}</span>}
                </div>
            </div>
        </ChartFrame>
    );
}
