import { useId, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Minus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";
import { Link } from "./Link";

// 指標（KPI）カード。DADS にはないため、ダッシュボードデザインの実践ガイドブック 4.1「指標」と
// docs/decisions.md D-12（増減の色）に従う。
//   - 指標は単体では判断しにくいので、前期比（delta）や注記（note: 出典・時点）を併記する。
//   - 増減は色だけに頼らず、矢印アイコンと符号（+ / -）を併記する（増加 trend-up = Blue 800、減少 trend-down = Red 900）。
//   - 左上に置く全体の指標は highlight（キーカラーの面）で最も目を引くようにする。
// section + aria-labelledby で、スクリーンリーダーが「ラベル → 値」の順に読める構造にする。

export type StatTrend = "up" | "down" | "flat";

export type StatDelta = {
    /** 表示する増減。符号を含める（例: "+12.3%"、"-5 件"）。 */
    value: string;
    trend: StatTrend;
    /** 比較対象（例: "前月比"）。 */
    label?: string;
};

export type StatCardProps = {
    label: ReactNode;
    /** 値。桁区切りなどは整形済みの文字列で渡す（等幅数字で表示する）。 */
    value: string;
    unit?: string;
    delta?: StatDelta;
    /** 注記・出典・時点（例: "2026年10月末時点"）。 */
    note?: ReactNode;
    /** ガイドブックの左上強調（キーカラーの面に白文字）。 */
    highlight?: boolean;
    icon?: LucideIcon;
    /** 詳細ページへのリンク。ラベルがリンクになり、カード全体がクリック領域になる。 */
    href?: string;
    className?: string;
};

const TREND: Record<StatTrend, { icon: LucideIcon; text: string; color: string }> = {
    up: { icon: ArrowUp, text: "増加", color: "text-trend-up" },
    down: { icon: ArrowDown, text: "減少", color: "text-trend-down" },
    flat: { icon: Minus, text: "横ばい", color: "text-text-muted" },
};

/** スクリーンリーダー向けの増減テキスト。「前月比12.3%増加」のように符号を言葉にする。 */
function describeDelta(delta: StatDelta): string {
    const magnitude = delta.value.replace(/^[+\-−±]\s*/, "");
    return [delta.label, magnitude, TREND[delta.trend].text].filter(Boolean).join("");
}

export function StatCard({ label, value, unit, delta, note, highlight = false, icon, href, className }: StatCardProps) {
    const labelId = useId();
    const trend = delta ? TREND[delta.trend] : null;

    return (
        <section
            aria-labelledby={labelId}
            className={cn(
                "relative flex flex-col gap-2 rounded-8 border p-4 md:p-6",
                highlight ? "border-transparent bg-surface-highlight text-on-highlight" : "border-border-on-canvas bg-surface text-text",
                href && "hover:shadow-1",
                className,
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <p id={labelId} className="m-0 text-16 font-bold leading-150">
                    {href ? (
                        // タイトルだけをリンクにし、擬似要素でカード全体に領域を広げる（カード全体を <a> にしない）
                        <Link to={href} className={cn("after:absolute after:inset-0 after:rounded-8", highlight && "text-on-highlight hover:text-on-highlight")}>
                            {label}
                        </Link>
                    ) : (
                        label
                    )}
                </p>
                {icon && <Icon icon={icon} size="lg" className={highlight ? "text-on-highlight" : "text-text-muted"} />}
            </div>
            <p className="m-0 flex items-baseline gap-1">
                <span className="text-std-28B-150 nums md:text-std-32B-150">{value}</span>
                {unit && <span className="text-16">{unit}</span>}
            </p>
            {delta && trend && (
                <p className={cn("m-0 flex items-center gap-1 text-16 leading-150", highlight ? "text-on-highlight" : trend.color)}>
                    <Icon icon={trend.icon} size="sm" />
                    <span aria-hidden="true" className="font-bold nums">
                        {delta.value}
                    </span>
                    {delta.label && <span aria-hidden="true">{delta.label}</span>}
                    <span className="sr-only">{describeDelta(delta)}</span>
                </p>
            )}
            {note && <p className={cn("m-0 text-14 leading-150", highlight ? "text-on-highlight" : "text-text-muted")}>{note}</p>}
        </section>
    );
}
