import type { MouseEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon, type IconSize } from "./Icon";

// DADS ページナビゲーション（https://design.digital.go.jp/dads/components/page-navigation/、HTML 版 page-navigation.css）。
// 前 / 次の丸い矢印ボタン（lg 44 / md 32 / sm 24。md / sm は見えないタップ領域で 44px を確保）とページ番号、
// または「n / N ページ」のカウンターで構成する。
// 先頭・末尾では前 / 次を disabled にせず aria-disabled にして押しても何も起きないようにする
// （Tab で到達でき、スクリーンリーダーが「これ以上ない」ことを知れる）。

export type PaginationSize = "lg" | "md" | "sm";

export type PaginationProps = {
    /** 現在のページ（1 始まり）。 */
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
    /** 現在ページの両側に表示するページ番号の数。 */
    siblingCount?: number;
    size?: PaginationSize;
    /** ページ番号の代わりに「n / N ページ」のカウンターを表示する。 */
    showCounter?: boolean;
    /** nav の aria-label。同じページに複数置くときは区別できる名前にする。 */
    label?: string;
    className?: string;
};

const ARROW_SIZE: Record<PaginationSize, { button: string; icon: IconSize; hover: string }> = {
    lg: { button: "size-11", icon: "lg", hover: "hover:border-3" },
    md: { button: "size-8 tap-area after:w-target", icon: "md", hover: "hover:border-3" },
    sm: { button: "size-6 tap-area after:w-target", icon: "sm", hover: "hover:border-2" },
};

const PAGE_SIZE: Record<PaginationSize, string> = {
    lg: "size-11 text-16",
    md: "size-8 tap-area after:w-target text-16",
    sm: "size-6 tap-area after:w-target text-14",
};

type PageItem = number | "ellipsis-start" | "ellipsis-end";

/** 表示するページ番号と省略の並びを求める（先頭と末尾は常に表示し、表示する個数が端でも変わらないようにする）。 */
export function getPageItems(page: number, totalPages: number, siblingCount: number): PageItem[] {
    const total = Math.max(1, totalPages);
    // 省略なしで収まる数（先頭 + 末尾 + 現在 + 両側の sibling + 省略 2 つ分）
    const maxWithoutEllipsis = siblingCount * 2 + 5;
    if (total <= maxWithoutEllipsis) return Array.from({ length: total }, (_, i) => i + 1);

    // 端に寄ったときも中央の個数（sibling * 2 + 1）を保つ
    const start = Math.max(Math.min(page - siblingCount, total - siblingCount * 2 - 2), 3);
    const end = Math.min(Math.max(page + siblingCount, siblingCount * 2 + 3), total - 2);

    const items: PageItem[] = [1];
    if (start > 3) items.push("ellipsis-start");
    else if (start === 3) items.push(2);
    for (let i = start; i <= end; i++) items.push(i);
    if (end < total - 2) items.push("ellipsis-end");
    else if (end === total - 2) items.push(total - 1);
    items.push(total);
    return items;
}

export function Pagination({ page, totalPages, onChange, siblingCount = 1, size = "lg", showCounter = false, label = "ページ送り", className }: PaginationProps) {
    const total = Math.max(1, totalPages);
    const current = Math.min(Math.max(1, page), total);
    const isFirst = current <= 1;
    const isLast = current >= total;
    const arrow = ARROW_SIZE[size];

    // aria-disabled のときは hover / active の変化を出さない（押しても何も起きないことと見た目を合わせる）
    const arrowClass = (disabled: boolean) =>
        cn(
            "inline-flex shrink-0 items-center justify-center rounded-full border border-current bg-surface p-0 transition-colors focus-visible:focus-ring",
            arrow.button,
            disabled
                ? "cursor-default text-text-disabled"
                : cn("text-primary-hover hover:bg-primary-outline-hover active:bg-primary-outline-active active:text-primary-active", arrow.hover),
        );

    const go = (next: number) => (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (next < 1 || next > total || next === current) return;
        onChange(next);
    };

    return (
        <nav aria-label={label} className={cn("text-16 leading-none tracking-2 text-text", className)}>
            <ul className="m-0 flex list-none flex-wrap items-center gap-4 p-0">
                <li className="flex">
                    <button type="button" className={arrowClass(isFirst)} aria-label="前のページ" aria-disabled={isFirst || undefined} onClick={go(current - 1)}>
                        <Icon icon={ChevronLeft} size={arrow.icon} />
                    </button>
                </li>
                {showCounter ? (
                    <li className="min-w-15 text-center whitespace-nowrap text-text-strong nums">
                        <span aria-current="page">{current}</span> / {total}ページ
                    </li>
                ) : (
                    getPageItems(current, total, siblingCount).map((item) =>
                        typeof item === "number" ? (
                            <li key={item} className="flex">
                                <button
                                    type="button"
                                    aria-current={item === current ? "page" : undefined}
                                    aria-label={`${item}ページ目`}
                                    className={cn(
                                        "inline-flex items-center justify-center rounded-full p-0 nums focus-visible:focus-ring",
                                        PAGE_SIZE[size],
                                        item === current
                                            ? "bg-primary font-bold text-text-on-primary"
                                            : "text-primary underline decoration-1 underline-offset-3 hover:bg-primary-surface hover:text-primary-hover hover:underline-thick active:bg-primary-surface-hover",
                                    )}
                                    onClick={go(item)}
                                >
                                    {item}
                                </button>
                            </li>
                        ) : (
                            <li key={item} className="text-text-muted" aria-hidden="true">
                                …
                            </li>
                        ),
                    )
                )}
                <li className="flex">
                    <button type="button" className={arrowClass(isLast)} aria-label="次のページ" aria-disabled={isLast || undefined} onClick={go(current + 1)}>
                        <Icon icon={ChevronRight} size={arrow.icon} />
                    </button>
                </li>
            </ul>
        </nav>
    );
}
