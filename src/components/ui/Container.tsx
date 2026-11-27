import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

// コンテンツ幅の上限と左右の余白。
//   md: 読み物・フォーム（local.css の --container-content。既定は 52rem = 832px、DADS 作例のコンテンツ幅）
//   lg: 一覧・ダッシュボード（--container-wide。既定は 80rem = 1280px）
//   full: 上限なし
// 左右の余白は local.css の画面の余白（--spacing-page-x / --spacing-page-x-wide）。

export type ContainerSize = "md" | "lg" | "full";

export type ContainerProps = HTMLAttributes<HTMLElement> & {
    children: ReactNode;
    size?: ContainerSize;
    /** 描画する要素。main / section などにできる。 */
    as?: ElementType;
    /** 左右の余白を付けない（親が余白を持つとき）。 */
    flush?: boolean;
};

const SIZE: Record<ContainerSize, string> = {
    md: "max-w-content",
    lg: "max-w-wide",
    full: "max-w-none",
};

export function Container({ children, size = "lg", as: Component = "div", flush = false, className, ...props }: ContainerProps) {
    return (
        <Component className={cn("mx-auto w-full", SIZE[size], !flush && "px-page-x md:px-page-x-wide", className)} {...props}>
            {children}
        </Component>
    );
}
