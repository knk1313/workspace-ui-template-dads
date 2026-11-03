import type { ReactNode } from "react";
import type { TooltipContentProps } from "recharts";
import { formatNumber } from "./chartUtils";

// recharts の Tooltip に渡すカスタム内容。
// 面（surface）に枠線と影 1、14px。値は桁区切り + 単位。系列の色の四角を名前の前に置く。
// キーボード利用者はツールチップを出せないため、同じ値は ChartFrame のデータテーブルで読める。

export type ChartTooltipProps = Partial<TooltipContentProps> & {
    /** 値の後ろに付ける単位（件、% など）。 */
    unit?: string;
    /** 値の整形を差し替える（100% 積み上げで割合を出すなど）。 */
    formatValue?: (value: unknown, entry: { name?: string; dataKey?: string | number }) => ReactNode;
    /** 見出し（X 軸の値）の整形。 */
    formatLabel?: (label: unknown) => ReactNode;
};

export function ChartTooltip({ active, payload, label, unit, formatValue, formatLabel }: ChartTooltipProps) {
    if (!active || !payload || payload.length === 0) return null;
    const heading = formatLabel ? formatLabel(label) : label === undefined || label === null ? null : String(label);
    return (
        <div className="rounded-4 border border-border bg-surface p-2 text-14 text-text shadow-1">
            {heading !== null && heading !== "" && <p className="mb-1 font-bold">{heading}</p>}
            <ul className="flex flex-col gap-0.5">
                {payload.map((entry, i) => {
                    const name = entry.name === undefined ? String(entry.dataKey ?? "") : String(entry.name);
                    const value = formatValue ? formatValue(entry.value, { name, dataKey: entry.dataKey as string | number | undefined }) : formatNumber(entry.value, unit);
                    return (
                        <li key={`${name}-${i}`} className="flex items-center gap-2">
                            <span className="inline-block size-3 shrink-0 border border-border" style={{ background: entry.color ?? entry.fill ?? entry.stroke }} aria-hidden="true" />
                            <span>{name}</span>
                            <span className="ml-auto pl-2 nums">{value}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
