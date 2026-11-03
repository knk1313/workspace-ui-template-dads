import type { HTMLAttributes, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";
import { Link } from "./Link";

// 縦積みリスト。申請・通知・メンバーなど、1 件ごとにタイトル・説明・右側のメタ情報を持つ項目を並べる。
// DADS のリソースリストに近いが管理画面向けに簡略化したもの。
// 行全体をリンクにするときはタイトルだけをリンク（またはボタン）にし、擬似要素（after:absolute after:inset-0）で
// 領域を行全体に広げる（DADS カードの「カード全体リンク」と同じ手法。スクリーンリーダーにはタイトルのリンクとして伝わる）。

export type StackedListProps = HTMLAttributes<HTMLUListElement> & {
    children: ReactNode;
};

export function StackedList({ className, children, ...props }: StackedListProps) {
    return (
        <ul className={cn("m-0 list-none divide-y divide-border p-0 text-16 leading-170 tracking-2 text-text", className)} {...props}>
            {children}
        </ul>
    );
}

export type StackedListItemProps = Omit<HTMLAttributes<HTMLLIElement>, "title" | "onClick"> & {
    title: ReactNode;
    description?: ReactNode;
    /** 右側に置く補足（日時、チップラベルなど）。 */
    meta?: ReactNode;
    /** 左側のアバターやアイコン。 */
    leading?: ReactNode;
    /** 行全体をリンクにする遷移先。 */
    href?: string;
    /** 行全体をボタンにする（ドロワーを開くなど）。href と同時には使わない。 */
    onClick?: () => void;
};

export function StackedListItem({ title, description, meta, leading, href, onClick, className, ...props }: StackedListItemProps) {
    const interactive = Boolean(href || onClick);
    const expand = "after:absolute after:inset-0";

    return (
        <li className={cn("relative flex items-start gap-4 px-4 py-4", interactive && "hover:bg-surface-hover", className)} {...props}>
            {leading && <div className="shrink-0">{leading}</div>}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="m-0 font-bold">
                    {href ? (
                        <Link to={href} className={expand}>
                            {title}
                        </Link>
                    ) : onClick ? (
                        <button
                            type="button"
                            onClick={onClick}
                            className={cn(
                                "border-0 bg-transparent p-0 text-left font-bold text-link underline decoration-1 underline-offset-3 hover:text-link-hover hover:underline-thick focus-visible:rounded-4 focus-visible:focus-ring-fill",
                                expand,
                            )}
                        >
                            {title}
                        </button>
                    ) : (
                        title
                    )}
                </p>
                {description && <div className="text-text-muted">{description}</div>}
            </div>
            {meta && <div className="shrink-0 text-right text-text-muted">{meta}</div>}
            {interactive && (
                <span className="flex h-lh shrink-0 items-center">
                    <Icon icon={ChevronRight} size="md" className="text-text-muted" />
                </span>
            )}
        </li>
    );
}
