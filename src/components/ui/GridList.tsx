import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Link } from "./Link";

// カード型のグリッド一覧。プロジェクト、テンプレート、メンバーなど、1 件ごとにカードで示す一覧に使う。
// DADS カードの要点（見出し・本文・リンク、カード全体リンクは見出しだけをリンクにして領域を広げる）に従う。
// <ul role="list">: list-style を消したリストを Safari の VoiceOver がリストとして読まなくなるのを防ぐ。

export type GridListColumns = 1 | 2 | 3 | 4;

const COLUMNS: Record<GridListColumns, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

export type GridListProps = HTMLAttributes<HTMLUListElement> & {
    children: ReactNode;
    /** 最大の列数（画面幅に応じて 1 列から増える）。 */
    columns?: GridListColumns;
};

export function GridList({ columns = 3, className, children, ...props }: GridListProps) {
    return (
        <ul role="list" className={cn("m-0 grid list-none gap-4 p-0 text-16 leading-170 tracking-2 text-text", COLUMNS[columns], className)} {...props}>
            {children}
        </ul>
    );
}

export type GridListItemProps = Omit<HTMLAttributes<HTMLLIElement>, "title"> & {
    title: ReactNode;
    description?: ReactNode;
    /** タイトルの上に置く補足（カテゴリ、チップラベルなど）。 */
    meta?: ReactNode;
    /** 左上のアイコンやアバター。 */
    leading?: ReactNode;
    /** 下部に置く操作（ボタン・リンク）。href と併用するときは操作が擬似要素の上に乗るよう relative にする。 */
    actions?: ReactNode;
    /** カード全体をリンクにする遷移先。 */
    href?: string;
};

export function GridListItem({ title, description, meta, leading, actions, href, className, ...props }: GridListItemProps) {
    return (
        <li className={cn("relative flex flex-col gap-2 rounded-8 border border-border bg-surface p-4", href && "hover:shadow-1", className)} {...props}>
            {(leading || meta) && (
                <div className="flex items-center gap-2 text-text-muted">
                    {leading}
                    {meta && <div className="min-w-0">{meta}</div>}
                </div>
            )}
            <p className="m-0 text-17 font-bold leading-150">
                {href ? (
                    <Link to={href} className="after:absolute after:inset-0 after:rounded-8">
                        {title}
                    </Link>
                ) : (
                    title
                )}
            </p>
            {description && <div className="text-text-muted">{description}</div>}
            {actions && <div className="relative mt-auto flex flex-wrap items-center gap-2 pt-2">{actions}</div>}
        </li>
    );
}
