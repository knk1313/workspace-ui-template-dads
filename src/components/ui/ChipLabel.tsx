import type { HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// DADS チップラベル（https://design.digital.go.jp/dads/components/chip-label/、HTML 版 chip-label.css）。
// 状態や分類を示すキーワードを表示する（受付中 / 審査中 / 完了など）。ユーザーが選んだ値を並べるときはチップタグを使う。
// 高さ 32px、角丸 8px、16px 文字（行高 1、字間 0.02em）、padding 3px 7px（text スタイルは 4px 8px）。
// スタイル: text（文字色のみ）/ outlined（枠 + 白地）/ filled-1（薄い背景 + 枠）/ filled-2（塗り + 白文字）。
// 色は DADS がプリミティブで規定しているのでプリミティブを直接使う（非テキスト色・背景・文字・濃い文字の 4 値）。
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
    gray: { border: "border-solid-gray-700", fill: "bg-solid-gray-700", iconFill: "text-solid-gray-700", bg: "bg-solid-gray-50", text: "text-solid-gray-800", textDark: "text-solid-gray-800" },
    blue: { border: "border-blue-700", fill: "bg-blue-700", iconFill: "text-blue-700", bg: "bg-blue-50", text: "text-blue-700", textDark: "text-blue-800" },
    "light-blue": { border: "border-light-blue-800", fill: "bg-light-blue-800", iconFill: "text-light-blue-800", bg: "bg-light-blue-50", text: "text-light-blue-800", textDark: "text-light-blue-900" },
    cyan: { border: "border-cyan-900", fill: "bg-cyan-900", iconFill: "text-cyan-900", bg: "bg-cyan-50", text: "text-cyan-900", textDark: "text-cyan-1000" },
    green: { border: "border-green-800", fill: "bg-green-800", iconFill: "text-green-800", bg: "bg-green-50", text: "text-green-800", textDark: "text-green-900" },
    lime: { border: "border-lime-900", fill: "bg-lime-900", iconFill: "text-lime-900", bg: "bg-lime-50", text: "text-lime-900", textDark: "text-lime-1000" },
    yellow: { border: "border-yellow-1000", fill: "bg-yellow-1000", iconFill: "text-yellow-1000", bg: "bg-yellow-50", text: "text-yellow-1000", textDark: "text-yellow-1100" },
    orange: { border: "border-orange-900", fill: "bg-orange-900", iconFill: "text-orange-900", bg: "bg-orange-50", text: "text-orange-900", textDark: "text-orange-1000" },
    red: { border: "border-red-900", fill: "bg-red-900", iconFill: "text-red-900", bg: "bg-red-50", text: "text-red-900", textDark: "text-red-1000" },
    magenta: { border: "border-magenta-800", fill: "bg-magenta-800", iconFill: "text-magenta-800", bg: "bg-magenta-50", text: "text-magenta-800", textDark: "text-magenta-900" },
    purple: { border: "border-purple-800", fill: "bg-purple-800", iconFill: "text-purple-800", bg: "bg-purple-50", text: "text-purple-800", textDark: "text-purple-800" },
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
