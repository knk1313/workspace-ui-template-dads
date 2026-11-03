import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

// DADS ディバイダー（https://design.digital.go.jp/dads/components/divider/ / HTML 版 divider.css）。
// 色: solid-gray-420（default）/ solid-gray-536（strong）/ black（emphasis）、太さ 1〜4px、実線 / 破線。
// 余白はディバイダー自身では持たない。リストでは 8px 以上、セクションでは 16px 以上の余白を周囲で確保する（className か親の gap）。
// 横は <hr>、縦は role="separator" + aria-orientation="vertical" の div。

export type DividerColor = "default" | "strong" | "emphasis";
export type DividerWeight = 1 | 2 | 3 | 4;
export type DividerStyle = "solid" | "dashed";
export type DividerOrientation = "horizontal" | "vertical";

export type DividerProps = Omit<HTMLAttributes<HTMLElement>, "style"> & {
    color?: DividerColor;
    weight?: DividerWeight;
    style?: DividerStyle;
    orientation?: DividerOrientation;
    /** 装飾として扱い、区切りとして読み上げない（リスト項目間など）。 */
    decorative?: boolean;
};

const COLOR: Record<DividerColor, string> = {
    default: "border-border",
    strong: "border-border-on-canvas",
    emphasis: "border-border-emphasis",
};

const WEIGHT: Record<DividerOrientation, Record<DividerWeight, string>> = {
    horizontal: { 1: "border-t", 2: "border-t-2", 3: "border-t-3", 4: "border-t-4" },
    vertical: { 1: "border-l", 2: "border-l-2", 3: "border-l-3", 4: "border-l-4" },
};

export function Divider({ color = "default", weight = 1, style = "solid", orientation = "horizontal", decorative = false, className, ...props }: DividerProps) {
    const classes = cn("m-0 shrink-0 border-0", WEIGHT[orientation][weight], COLOR[color], style === "dashed" && "border-dashed", className);
    if (orientation === "vertical") {
        return (
            <div
                role={decorative ? "presentation" : "separator"}
                aria-orientation={decorative ? undefined : "vertical"}
                className={cn(classes, "self-stretch")}
                {...props}
            />
        );
    }
    return <hr role={decorative ? "presentation" : undefined} className={cn(classes, "w-full")} {...props} />;
}
