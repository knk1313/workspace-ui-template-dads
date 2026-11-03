import { useId, useState, type HTMLAttributes } from "react";
import { NavLink, useLocation } from "react-router";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// 階層付きサイドナビゲーション（AppShell のサイドバーとモバイルドロワーで共有）。
// DADS にはサイドナビの規定がないため、メニューリスト / モバイルメニューの状態表現を適用した:
//   - 項目は高さ 44px 以上、16px、hover は背景 solid-gray-50 + 下線。
//   - 現在地は背景 key-50 + 文字 key-900 太字 + 左の縦棒 4px（key-900）+ aria-current="page"（NavLink が付ける）。
//   - 子項目を持つ親は開閉ボタン（<button aria-expanded aria-controls>）にする。現在地を含む親は初期展開して太字にする。
//     折りたたみ表示では子を出せないので、親の href へのリンク（アイコン）にする。
//   - collapsed（折りたたみ）ではアイコンだけを表示し、ラベルは sr-only と title で残す。
// app.config.ts の NavSection をそのまま渡せる。

export type SideNavChild = { readonly label: string; readonly href: string; readonly end?: boolean };

export type SideNavItem = {
    readonly label: string;
    /** リンク先。子項目を持つ場合は折りたたみ表示のときのリンク先になる。 */
    readonly href: string;
    readonly icon?: LucideIcon;
    /** パスが完全一致したときだけ現在地にする。省略時は "/" のみ完全一致。 */
    readonly end?: boolean;
    readonly children?: readonly SideNavChild[];
};

export type SideNavSection = {
    readonly title?: string;
    readonly items: readonly SideNavItem[];
};

export type SideNavProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
    sections: readonly SideNavSection[];
    /** アイコンだけの細い表示（デスクトップでサイドバーを畳んだとき）。 */
    collapsed?: boolean;
    /** 項目を選んだときの処理（モバイルのドロワーを閉じるなど）。 */
    onNavigate?: () => void;
    label?: string;
};

const ITEM_BASE =
    "relative flex min-h-11 w-full items-center gap-2 rounded-8 py-2 text-16 leading-130 tracking-0 no-underline transition-colors focus-visible:focus-ring-fill";
const ITEM_IDLE = "text-text hover:bg-surface-muted hover:text-text-strong hover:underline hover:decoration-1 hover:underline-offset-3";
const ITEM_ACTIVE = "bg-primary-surface font-bold text-primary before:absolute before:inset-y-1 before:left-0 before:w-1 before:rounded-full before:bg-primary";

function isWithin(pathname: string, href: string, end: boolean): boolean {
    if (end) return pathname === href;
    return pathname === href || pathname.startsWith(href.endsWith("/") ? href : `${href}/`);
}

type ItemProps = {
    item: SideNavItem;
    collapsed: boolean;
    onNavigate?: () => void;
};

function Item({ item, collapsed, onNavigate }: ItemProps) {
    const { pathname } = useLocation();
    const subId = useId();
    const children = item.children ?? [];
    const hasChildren = children.length > 0;
    const containsCurrent = hasChildren && children.some((c) => isWithin(pathname, c.href, c.end ?? false));
    const [open, setOpen] = useState(containsCurrent);

    // 子項目を持たない項目、または折りたたみ表示（子は出せないので親の href へのリンクにする）。
    if (!hasChildren || collapsed) {
        const end = hasChildren ? false : (item.end ?? item.href === "/");
        return (
            <li>
                <NavLink
                    to={item.href}
                    end={end}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) => cn(ITEM_BASE, collapsed ? "justify-center px-2" : "px-3", isActive ? ITEM_ACTIVE : ITEM_IDLE)}
                >
                    {item.icon && <Icon icon={item.icon} size="lg" />}
                    <span className={cn("min-w-0 break-words", collapsed && "sr-only")}>{item.label}</span>
                </NavLink>
            </li>
        );
    }

    // 子項目を持つ親は開閉ボタン（APG Disclosure）。親自体はリンクにせず、現在地は子項目にだけ付ける。
    return (
        <li>
            <button
                type="button"
                aria-expanded={open}
                aria-controls={subId}
                onClick={() => setOpen((v) => !v)}
                className={cn(ITEM_BASE, "px-3 text-left", ITEM_IDLE, containsCurrent && "font-bold")}
            >
                {item.icon && <Icon icon={item.icon} size="lg" />}
                <span className="min-w-0 flex-1 break-words">{item.label}</span>
                <Icon icon={ChevronDown} size="md" className={cn("transition-transform", open && "rotate-180")} />
            </button>
            <ul id={subId} hidden={!open} className="m-0 mt-1 flex list-none flex-col gap-1 p-0">
                {children.map((child) => (
                    <li key={child.href}>
                        <NavLink
                            to={child.href}
                            end={child.end}
                            onClick={onNavigate}
                            className={({ isActive }) => cn(ITEM_BASE, "pr-3 pl-11", isActive ? ITEM_ACTIVE : ITEM_IDLE)}
                        >
                            <span className="min-w-0 break-words">{child.label}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </li>
    );
}

export function SideNav({ sections, collapsed = false, onNavigate, label = "メインナビゲーション", className, ...props }: SideNavProps) {
    return (
        <nav aria-label={label} className={cn("flex flex-col gap-6 px-2 py-4", className)} {...props}>
            {sections.map((section, i) => (
                <div key={section.title ?? i} className="flex flex-col gap-1">
                    {section.title && (
                        // セクション見出し。補助用途なので 14px 太字を許容する。折りたたみ時は sr-only で残す。
                        <p className={cn("m-0 px-3 py-1 text-14 leading-130 font-bold tracking-0 text-text-muted", collapsed && "sr-only")}>{section.title}</p>
                    )}
                    <ul className="m-0 flex list-none flex-col gap-1 p-0">
                        {section.items.map((item) => (
                            <Item key={item.href} item={item} collapsed={collapsed} onNavigate={onNavigate} />
                        ))}
                    </ul>
                </div>
            ))}
        </nav>
    );
}
