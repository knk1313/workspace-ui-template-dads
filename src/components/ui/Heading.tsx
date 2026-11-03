import type { HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// DADS 見出し（https://design.digital.go.jp/dads/components/heading/ / HTML 版 heading.css）。
//   - level（h1〜h6: 文書構造）と size（文字サイズ）は別々に指定する。レベルを飛ばさない。
//   - shoulder（肩見出し）/ subtitle は <p> にして <hgroup> でまとめる（見出し要素にしない）。
//   - chip は左の縦棒（key-900）、rule は下の飾り罫（2 / 4 / 6 / 8px）。icon はリードアイコン（装飾）。
//   - 既定サイズ: h1 32 / h2 24 / h3 20 / h4 18 / h5 16 / h6 16（管理画面向け。ページタイトルは PageHeader が 28 を使う）。

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 64 | 57 | 45 | 36 | 32 | 28 | 24 | 20 | 18 | 16;
export type HeadingRule = 2 | 4 | 6 | 8;

export type HeadingProps = Omit<HTMLAttributes<HTMLHeadingElement>, "children"> & {
    children: ReactNode;
    level: HeadingLevel;
    size?: HeadingSize;
    /** 肩見出し（見出しの上に置く小さな太字）。 */
    shoulder?: ReactNode;
    /** サブタイトル（見出しの下）。 */
    subtitle?: ReactNode;
    /** 左の縦棒（チップ）。 */
    chip?: boolean;
    /** 下の飾り罫の太さ。 */
    rule?: HeadingRule;
    /** リードアイコン（装飾）。 */
    icon?: LucideIcon;
};

const DEFAULT_SIZE: Record<HeadingLevel, HeadingSize> = { 1: 32, 2: 24, 3: 20, 4: 18, 5: 16, 6: 16 };

const SIZE: Record<HeadingSize, string> = {
    64: "text-dsp-64B-140",
    57: "text-dsp-57B-140",
    45: "text-std-45B-140",
    36: "text-std-36B-140",
    32: "text-std-32B-150",
    28: "text-std-28B-150",
    24: "text-std-24B-150",
    20: "text-std-20B-150",
    18: "text-std-18B-160",
    16: "text-std-16B-170",
};

// 肩見出しのサイズ（heading.css の --_shoulder-size）。
const SHOULDER: Record<HeadingSize, string> = {
    64: "text-28 leading-150 tracking-1",
    57: "text-24 leading-150 tracking-2",
    45: "text-22 leading-150 tracking-2",
    36: "text-20 leading-150 tracking-2",
    32: "text-18 leading-160 tracking-2",
    28: "text-16 leading-170 tracking-2",
    24: "text-16 leading-170 tracking-2",
    20: "text-16 leading-170 tracking-2",
    18: "text-16 leading-170 tracking-2",
    16: "text-16 leading-170 tracking-2",
};

// チップの幅は文字サイズの 1/3（heading.css: calc(1em / 3)）。spacing スケールで近似する。
const CHIP: Record<HeadingSize, string> = {
    64: "pl-7 before:w-5",
    57: "pl-7 before:w-5",
    45: "pl-6 before:w-4",
    36: "pl-5 before:w-3",
    32: "pl-5 before:w-3",
    28: "pl-4 before:w-2",
    24: "pl-4 before:w-2",
    20: "pl-3.5 before:w-1.5",
    18: "pl-3.5 before:w-1.5",
    16: "pl-3 before:w-1",
};

const RULE: Record<HeadingRule, string> = {
    2: "border-b-2 pb-2",
    4: "border-b-4 pb-4",
    6: "border-b-6 pb-6",
    8: "border-b-8 pb-8",
};

const ICON_SIZE: Record<HeadingSize, "md" | "lg" | "xl"> = {
    64: "xl",
    57: "xl",
    45: "xl",
    36: "xl",
    32: "lg",
    28: "lg",
    24: "lg",
    20: "lg",
    18: "md",
    16: "md",
};

export function Heading({ children, level, size, shoulder, subtitle, chip = false, rule, icon, className, ...props }: HeadingProps) {
    const Tag = `h${level}` as const;
    const resolvedSize = size ?? DEFAULT_SIZE[level];
    const grouped = Boolean(shoulder || subtitle);

    // 装飾（サイズ・チップ・飾り罫）は、hgroup があるときは hgroup に、ないときは見出し要素自身に付ける。
    const decoration = cn(
        "m-0 text-text-strong",
        SIZE[resolvedSize],
        chip && cn("relative before:absolute before:inset-y-1 before:left-0 before:bg-primary", CHIP[resolvedSize]),
        rule && cn("border-primary", RULE[rule]),
        className,
    );

    const content = (
        <>
            {icon && <Icon icon={icon} size={ICON_SIZE[resolvedSize]} className="mr-1 inline-block align-text-bottom" />}
            {children}
        </>
    );

    if (!grouped) {
        return (
            <Tag className={decoration} {...props}>
                {content}
            </Tag>
        );
    }

    return (
        <hgroup className={decoration}>
            {shoulder && <p className={cn("m-0 font-bold", SHOULDER[resolvedSize])}>{shoulder}</p>}
            <Tag className="m-0" {...props}>
                {content}
            </Tag>
            {subtitle && <p className="m-0 text-std-16N-170 text-text-muted">{subtitle}</p>}
        </hgroup>
    );
}
