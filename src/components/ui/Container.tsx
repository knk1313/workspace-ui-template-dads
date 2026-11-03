import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

// コンテンツ幅の上限と左右の余白。
//   md: 52rem（832px。DADS 作例のコンテンツ幅）… 読み物・フォーム
//   lg: 80rem（1280px）… 一覧・ダッシュボード
//   full: 上限なし
// 左右の余白は DADS の余白ルールに合わせ、モバイル 16px / md 以上 24px。
// 幅は Tailwind の spacing スケール（4px 刻み）で表す: max-w-208 = 52rem、max-w-320 = 80rem。

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
    md: "max-w-208",
    lg: "max-w-320",
    full: "max-w-none",
};

export function Container({ children, size = "lg", as: Component = "div", flush = false, className, ...props }: ContainerProps) {
    return (
        <Component className={cn("mx-auto w-full", SIZE[size], !flush && "px-4 md:px-6", className)} {...props}>
            {children}
        </Component>
    );
}
