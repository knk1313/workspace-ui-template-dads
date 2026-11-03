import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router";
import { Menu, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

// アプリケーションシェル（AppShell / TopNavLayout）で共有するヘッダーの部品。
//   - SkipLink: 「本文へスキップ」。最初の Tab で現れ、<main id="main"> に移動する。
//   - HamburgerButton: DADS ハンバーガーメニューボタン（アイコン + 「メニュー」のラベル。aria-expanded / aria-controls）。
//   - Brand: アプリのロゴとアプリ名（ホームへのリンク）。
//   - ShellHeader: 高さ 64px、白い面 + 下の罫線。

export type SkipLinkProps = { targetId?: string };

export function SkipLink({ targetId = "main" }: SkipLinkProps) {
    return (
        <a
            href={`#${targetId}`}
            className="sr-only z-50 rounded-8 bg-surface px-4 py-3 text-16 font-bold text-link focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus-visible:focus-ring"
        >
            本文へスキップ
        </a>
    );
}

export type HamburgerButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    open: boolean;
    /** 開閉するメニューの id。 */
    controls: string;
    /** ラベル。DADS はページ言語に合わせて「メニュー」/「MENU」を使い分ける。 */
    label?: string;
};

export function HamburgerButton({ open, controls, label = "メニュー", className, type = "button", ...props }: HamburgerButtonProps) {
    return (
        <button
            type={type}
            aria-expanded={open}
            aria-controls={controls}
            className={cn(
                "flex min-h-11 shrink-0 items-center gap-1 rounded-6 px-3 py-1 text-16 leading-100 tracking-2 text-text transition-colors",
                "hover:bg-surface-muted hover:underline hover:underline-offset-3 focus-visible:focus-ring-fill",
                className,
            )}
            {...props}
        >
            <Icon icon={open ? X : Menu} size="lg" className="text-text-strong" />
            {label}
        </button>
    );
}

export type BrandProps = {
    name: string;
    logo?: LucideIcon;
    href?: string;
    className?: string;
};

export function Brand({ name, logo, href = "/", className }: BrandProps) {
    return (
        <Link
            to={href}
            className={cn(
                "flex min-h-11 min-w-0 items-center gap-2 rounded-4 px-1 text-18 leading-130 font-bold tracking-0 text-text-strong no-underline hover:underline focus-visible:focus-ring-fill",
                className,
            )}
        >
            {logo && <Icon icon={logo} size="lg" className="text-primary" />}
            {/* 狭い画面では折り返す（1 行で切ると「申請管…」のように名前が読めなくなるため）。
                sm 未満は 16px にして、文字間隔を広げたとき（WCAG 1.4.12）も 3 行まで高さ 64px のヘッダーに収める */}
            <span className="line-clamp-3 break-words max-sm:text-16">{name}</span>
        </Link>
    );
}

export type ShellHeaderProps = {
    children: ReactNode;
    className?: string;
};

export function ShellHeader({ children, className }: ShellHeaderProps) {
    return (
        <header className={cn("relative z-20 flex h-header shrink-0 items-center gap-2 border-b border-border bg-surface px-2 md:gap-4 md:px-4", className)}>
            {children}
        </header>
    );
}
