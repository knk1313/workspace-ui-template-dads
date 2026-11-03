import type { HTMLAttributes, ReactNode } from "react";
import { Circle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// アクティビティフィード。「誰が」「何を」「どうした」「いつ」を新しい順に並べる（監査ログ、申請の履歴など）。
// 各項目を縦線でつないで時系列であることを示す。時刻は <time dateTime> で機械可読にする。
// 文は「{actor}が{target}を{action}」の形で組み立てる。target がなければ「{actor}が{action}」。

export type ActivityItem = {
    id: string;
    /** 操作した人（例: "山田 太郎"）。 */
    actor: ReactNode;
    /** 操作（例: "承認しました"）。 */
    action: ReactNode;
    /** 操作の対象（例: "申請 #1234"）。リンクにしてもよい。 */
    target?: ReactNode;
    /** ISO 8601 の日時。<time dateTime> に入る。 */
    time: string;
    /** 表示する日時のラベル（例: "3 分前"）。省略時は日本語の日時に整形する。 */
    timeLabel?: string;
    /** 補足（コメント本文など）。 */
    description?: ReactNode;
    icon?: LucideIcon;
    /** アイコンの代わりに置くアバターなど。 */
    avatar?: ReactNode;
};

export type ActivityFeedProps = Omit<HTMLAttributes<HTMLOListElement>, "children"> & {
    items: ActivityItem[];
};

const formatter = new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

/** ISO 日時を日本語の表示に整形する。不正な値はそのまま返す。 */
export function formatDateTime(iso: string): string {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? iso : formatter.format(date);
}

export function ActivityFeed({ items, className, ...props }: ActivityFeedProps) {
    return (
        <ol className={cn("m-0 list-none p-0 text-16 leading-170 tracking-2 text-text", className)} {...props}>
            {items.map((item, index) => {
                const last = index === items.length - 1;
                return (
                    <li key={item.id} className={cn("relative flex gap-3", !last && "pb-6")}>
                        {/* 縦線: マーカー（32px）の中心から次の項目まで */}
                        {!last && <span aria-hidden="true" className="absolute top-8 bottom-0 left-4 w-px -translate-x-1/2 bg-border" />}
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-strong text-text-muted">
                            {item.avatar ?? <Icon icon={item.icon ?? Circle} size="sm" />}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
                            <p className="m-0">
                                <span className="font-bold">{item.actor}</span>が{item.target && <>{item.target}を</>}
                                {item.action}
                            </p>
                            {item.description && <div className="rounded-8 bg-surface-muted px-4 py-3 text-text">{item.description}</div>}
                            <p className="m-0 text-14 leading-150 text-text-muted">
                                <time dateTime={item.time}>{item.timeLabel ?? formatDateTime(item.time)}</time>
                            </p>
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
