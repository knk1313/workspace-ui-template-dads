import type { AnchorHTMLAttributes, ReactNode, Ref } from "react";
import { Link as RouterLink, type LinkProps as RouterLinkProps } from "react-router";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// DADS リンクテキスト（Foundations: リンクテキスト / HTML 版 link.css）。
// 下線 1px（hover 3px）+ リンクカラー。色だけで区別しない。訪問済みはマゼンタ。
// 新規タブで開くリンクは末尾にアイコンを置き、代替テキスト「新しいタブで開きます」を付ける。
// 訪問済みの色は、パンくずリストのように「ほぼ必ず訪問済みになるナビゲーション」では意味を持たないため、
// visited={false} で外せる（docs/decisions.md D-37）。
const LINK_BASE_CLASS =
    "text-link underline decoration-1 underline-offset-3 hover:text-link-hover hover:underline-thick active:text-link-active active:decoration-1 focus-visible:focus-ring-fill focus-visible:rounded-inline";
export const LINK_CLASS = cn(LINK_BASE_CLASS, "visited:text-link-visited");

export type LinkProps = Omit<RouterLinkProps, "className"> & {
    className?: string;
    ref?: Ref<HTMLAnchorElement>;
    /** 訪問済みの色にする（既定）。false にすると、訪問済みでもリンクの色のまま。 */
    visited?: boolean;
};

/** アプリ内のページへのリンク（react-router）。 */
export function Link({ className, visited = true, ...props }: LinkProps) {
    return <RouterLink className={cn(visited ? LINK_CLASS : LINK_BASE_CLASS, className)} {...props} />;
}

export type ExternalAnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "target" | "rel"> & {
    children: ReactNode;
    className?: string;
    /** 新しいタブで開く。末尾にアイコンと代替テキストを付ける。 */
    newTab?: boolean;
    ref?: Ref<HTMLAnchorElement>;
};

/** 外部サイトやファイルへのリンク（通常の <a>）。 */
export function Anchor({ className, newTab = false, children, ...props }: ExternalAnchorProps) {
    return (
        <a className={cn(LINK_CLASS, className)} target={newTab ? "_blank" : undefined} rel={newTab ? "noopener noreferrer" : undefined} {...props}>
            {children}
            {newTab && <Icon icon={ExternalLink} size="sm" label="新しいタブで開きます" className="ml-1 inline-block align-text-bottom" />}
        </a>
    );
}
