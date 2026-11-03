import type { HTMLAttributes, ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// タイムライン。手続きの履歴や進行状況（受付 → 審査 → 承認 → 完了）を時系列に示す。
// 状態は丸いマーカーで示す: done = キーカラーの塗り + チェック、current = キーカラーの枠（aria-current="step"）、upcoming = 薄い枠。
// 色だけに頼らず、マーカーの形（塗り / 枠 / チェック）とスクリーンリーダー向けの状態テキストを併記する。
// 手続き全体の案内（操作者が進める）には DADS ステップナビゲーションを使い、こちらは閲覧用の履歴に使う。

export type TimelineStatus = "done" | "current" | "upcoming";

export type TimelineItem = {
    id: string;
    title: ReactNode;
    description?: ReactNode;
    /** 日付や日時のラベル（例: "2026年10月1日"）。 */
    date?: string;
    /** <time dateTime> に入れる ISO 8601 の値。省略時は date をそのまま表示する。 */
    dateTime?: string;
    status: TimelineStatus;
};

export type TimelineProps = Omit<HTMLAttributes<HTMLOListElement>, "children"> & {
    items: TimelineItem[];
};

const STATUS: Record<TimelineStatus, { marker: string; text: string }> = {
    done: { marker: "border-primary bg-primary text-text-on-primary", text: "完了" },
    current: { marker: "border-primary bg-surface text-primary", text: "現在" },
    upcoming: { marker: "border-border bg-surface text-text-muted", text: "未着手" },
};

export function Timeline({ items, className, ...props }: TimelineProps) {
    return (
        <ol className={cn("m-0 list-none p-0 text-16 leading-170 tracking-2 text-text", className)} {...props}>
            {items.map((item, index) => {
                const last = index === items.length - 1;
                const status = STATUS[item.status];
                return (
                    <li key={item.id} aria-current={item.status === "current" ? "step" : undefined} className={cn("relative flex gap-3", !last && "pb-6")}>
                        {!last && (
                            <span
                                aria-hidden="true"
                                className={cn("absolute top-4 bottom-0 left-4 w-0.5 -translate-x-1/2", item.status === "done" ? "bg-primary" : "bg-border")}
                            />
                        )}
                        {/* 1 行目の高さの枠で上下中央に置き、見出しが何行になってもマーカーを 1 行目の中央にそろえる */}
                        <span aria-hidden="true" className="relative flex h-lh shrink-0 items-center">
                            <span className={cn("flex size-8 items-center justify-center rounded-full border-3", status.marker)}>
                                {item.status === "done" && <Icon icon={Check} size="sm" className="stroke-3" />}
                                {item.status === "current" && <span className="size-3 rounded-full bg-primary" />}
                            </span>
                        </span>
                        <div className={cn("flex min-w-0 flex-1 flex-col gap-1", item.status === "upcoming" && "text-text-muted")}>
                            <p className="m-0 font-bold">
                                {item.title}
                                <span className="sr-only">（{status.text}）</span>
                            </p>
                            {item.description && <div>{item.description}</div>}
                            {item.date && (
                                <p className="m-0 text-14 leading-150 text-text-muted">
                                    <time dateTime={item.dateTime}>{item.date}</time>
                                </p>
                            )}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
