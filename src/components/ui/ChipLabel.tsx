import type { HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// DADS チップラベル（https://design.digital.go.jp/dads/components/chip-label/、HTML 版 chip-label.css）。
// 状態や分類を示すキーワードを表示する（受付中 / 審査中 / 完了など）。ユーザーが選んだ値を並べるときはチップタグを使う。
// 高さ 32px、角丸 8px、16px 文字（行高 1、字間 0.02em）、padding 3px 7px（text スタイルは 4px 8px）。
// スタイル: text（文字色のみ）/ outlined（枠 + 白地）/ filled-1（薄い背景 + 枠）/ filled-2（塗り + 白文字）。
// 色は DADS がプリミティブで規定しているのでプリミティブを直接使う（非テキスト色・背景・文字・濃い文字の 4 値）。
// ダークモードの色（dark:）は DADS に規定がないため、同じ色相の明るい段を独自に選んでいる（docs/decisions.md D-31）。
// 色だけで意味を伝えず、必ずテキストで状態を書く。色数は絞る。

export type ChipLabelStyle = "text" | "outlined" | "filled-1" | "filled-2";
export type ChipLabelColor = "gray" | "blue" | "light-blue" | "cyan" | "green" | "lime" | "yellow" | "orange" | "red" | "magenta" | "purple";

type ColorClasses = {
    /** 非テキスト色（枠線、filled-2 の背景、filled-1 のアイコン）。 */
    border: string;
    fill: string;
    iconFill: string;
    /** filled-1 の薄い背景。 */
    bg: string;
    /** 文字色（text / outlined）。 */
    text: string;
    /** 薄い背景の上の濃い文字色（filled-1）。 */
    textDark: string;
};

const COLORS: Record<ChipLabelColor, ColorClasses> = {
    gray: { border: "border-solid-gray-700 dark:border-solid-gray-420", fill: "bg-solid-gray-700 dark:bg-solid-gray-300", iconFill: "text-solid-gray-700 dark:text-solid-gray-300", bg: "bg-solid-gray-50 dark:bg-solid-gray-800", text: "text-solid-gray-800 dark:text-solid-gray-200", textDark: "text-solid-gray-800 dark:text-solid-gray-100" },
    blue: { border: "border-blue-700 dark:border-blue-400", fill: "bg-blue-700 dark:bg-blue-300", iconFill: "text-blue-700 dark:text-blue-300", bg: "bg-blue-50 dark:bg-blue-1200", text: "text-blue-700 dark:text-blue-300", textDark: "text-blue-800 dark:text-blue-200" },
    "light-blue": { border: "border-light-blue-800 dark:border-light-blue-400", fill: "bg-light-blue-800 dark:bg-light-blue-300", iconFill: "text-light-blue-800 dark:text-light-blue-300", bg: "bg-light-blue-50 dark:bg-light-blue-1200", text: "text-light-blue-800 dark:text-light-blue-300", textDark: "text-light-blue-900 dark:text-light-blue-200" },
    cyan: { border: "border-cyan-900 dark:border-cyan-400", fill: "bg-cyan-900 dark:bg-cyan-300", iconFill: "text-cyan-900 dark:text-cyan-300", bg: "bg-cyan-50 dark:bg-cyan-1200", text: "text-cyan-900 dark:text-cyan-300", textDark: "text-cyan-1000 dark:text-cyan-200" },
    green: { border: "border-green-800 dark:border-green-400", fill: "bg-green-800 dark:bg-green-300", iconFill: "text-green-800 dark:text-green-300", bg: "bg-green-50 dark:bg-green-1200", text: "text-green-800 dark:text-green-300", textDark: "text-green-900 dark:text-green-200" },
    lime: { border: "border-lime-900 dark:border-lime-400", fill: "bg-lime-900 dark:bg-lime-300", iconFill: "text-lime-900 dark:text-lime-300", bg: "bg-lime-50 dark:bg-lime-1200", text: "text-lime-900 dark:text-lime-300", textDark: "text-lime-1000 dark:text-lime-200" },
    yellow: { border: "border-yellow-1000 dark:border-yellow-400", fill: "bg-yellow-1000 dark:bg-yellow-300", iconFill: "text-yellow-1000 dark:text-yellow-300", bg: "bg-yellow-50 dark:bg-yellow-1200", text: "text-yellow-1000 dark:text-yellow-300", textDark: "text-yellow-1100 dark:text-yellow-200" },
    orange: { border: "border-orange-900 dark:border-orange-400", fill: "bg-orange-900 dark:bg-orange-300", iconFill: "text-orange-900 dark:text-orange-300", bg: "bg-orange-50 dark:bg-orange-1200", text: "text-orange-900 dark:text-orange-300", textDark: "text-orange-1000 dark:text-orange-200" },
    red: { border: "border-red-900 dark:border-red-400", fill: "bg-red-900 dark:bg-red-300", iconFill: "text-red-900 dark:text-red-300", bg: "bg-red-50 dark:bg-red-1200", text: "text-red-900 dark:text-red-300", textDark: "text-red-1000 dark:text-red-200" },
    magenta: { border: "border-magenta-800 dark:border-magenta-400", fill: "bg-magenta-800 dark:bg-magenta-300", iconFill: "text-magenta-800 dark:text-magenta-300", bg: "bg-magenta-50 dark:bg-magenta-1200", text: "text-magenta-800 dark:text-magenta-300", textDark: "text-magenta-900 dark:text-magenta-200" },
    purple: { border: "border-purple-800 dark:border-purple-400", fill: "bg-purple-800 dark:bg-purple-300", iconFill: "text-purple-800 dark:text-purple-300", bg: "bg-purple-50 dark:bg-purple-1200", text: "text-purple-800 dark:text-purple-300", textDark: "text-purple-800 dark:text-purple-200" },
};

export type ChipLabelProps = Omit<HTMLAttributes<HTMLSpanElement>, "style" | "color"> & {
    children: ReactNode;
    style?: ChipLabelStyle;
    color?: ChipLabelColor;
    /** リードアイコン（24px、装飾）。 */
    icon?: LucideIcon;
};

export function chipLabelClassName(style: ChipLabelStyle, color: ChipLabelColor, className?: string): string {
    const c = COLORS[color];
    return cn(
        "inline-flex min-h-8 max-w-full items-center gap-1 rounded-8 text-16 font-normal leading-none tracking-2 break-words",
        style === "text" ? "px-2 py-1" : "px-1.75 py-0.75",
        style === "text" && c.text,
        style === "outlined" && cn("border bg-surface", c.border, c.text),
        style === "filled-1" && cn("border", c.border, c.bg, c.textDark),
        style === "filled-2" && cn("border border-transparent text-text-inverse", c.fill),
        className,
    );
}

export function ChipLabel({ children, style = "outlined", color = "gray", icon, className, ...props }: ChipLabelProps) {
    const c = COLORS[color];
    return (
        <span className={chipLabelClassName(style, color, className)} data-style={style} data-color={color} {...props}>
            {icon && <Icon icon={icon} size="lg" className={cn("-my-1", style === "filled-1" && c.iconFill)} />}
            <span>{children}</span>
        </span>
    );
}

// 意味（状態）を伝えるチップ。success → green、error → red、warning → yellow、info → blue、neutral → gray。
// 色の割り当てを一か所にまとめ、画面ごとに色が揺れないようにする。
export type ChipStatus = "success" | "error" | "warning" | "info" | "neutral";

export const STATUS_COLOR: Record<ChipStatus, ChipLabelColor> = {
    success: "green",
    error: "red",
    warning: "yellow",
    info: "blue",
    neutral: "gray",
};

export type StatusChipProps = Omit<ChipLabelProps, "color"> & {
    status: ChipStatus;
};

export function StatusChip({ status, style = "filled-1", ...props }: StatusChipProps) {
    return <ChipLabel color={STATUS_COLOR[status]} style={style} data-status={status} {...props} />;
}
