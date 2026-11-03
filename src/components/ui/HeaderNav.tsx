import type { HTMLAttributes } from "react";
import { NavLink } from "react-router";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// DADS 水平メニュー（https://design.digital.go.jp/dads/components/horizontal-menu/ / HTML 版 horizontal-menu.css）。
//   - <nav> + <ul>。項目は高さ 64px（ヘッダーと同じ）、太字 16px、左右 20px のパディング。
//   - 現在地は下線 4px（key-900）+ 文字色 key-1000 + aria-current="page"（NavLink が付ける）。
//   - hover は背景 solid-gray-50 + 下線 2px（黒）。フォーカスはリンクと同じ黄色の塗り。
// サイトのカテゴリ・目的地への移動に使う。同じ主題の切り替えはタブを使う。

export type HeaderNavItem = {
    label: string;
    href: string;
    icon?: LucideIcon;
    /** パスが完全一致したときだけ現在地にする（"/" など）。省略時は "/" のみ完全一致。 */
    end?: boolean;
};

export type HeaderNavProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
    items: readonly HeaderNavItem[];
    label?: string;
};

export function HeaderNav({ items, label = "メインナビゲーション", className, ...props }: HeaderNavProps) {
    return (
        <nav aria-label={label} className={cn("min-w-0", className)} {...props}>
            <ul className="m-0 flex list-none items-stretch overflow-x-auto p-0">
                {items.map((item) => (
                    <li key={item.href} className="flex shrink-0 items-stretch">
                        <NavLink
                            to={item.href}
                            end={item.end ?? item.href === "/"}
                            className={({ isActive }) =>
                                cn(
                                    "relative flex min-h-16 items-center gap-1 px-5 py-4 text-16 leading-130 font-bold tracking-0 no-underline transition-colors",
                                    "after:absolute after:inset-x-0 after:bottom-0",
                                    "focus-visible:focus-ring-fill focus-visible:rounded-4",
                                    isActive
                                        ? "bg-surface text-primary-hover after:h-1 after:bg-primary hover:text-primary hover:underline hover:decoration-1 hover:underline-offset-3"
                                        : "text-text-strong hover:bg-surface-muted hover:after:h-0.5 hover:after:bg-border-emphasis",
                                )
                            }
                        >
                            {item.icon && <Icon icon={item.icon} size="lg" />}
                            {item.label}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
