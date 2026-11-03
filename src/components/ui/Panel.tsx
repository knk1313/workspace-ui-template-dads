import type { HTMLAttributes, ReactNode } from "react";
import { useId } from "react";
import { cn } from "@/lib/cn";

// 地（canvas）と同系色の面。フィルター領域、補足情報、設定のまとまりなど、
// カードほど強く区切らずに「ひとかたまり」を示したいときに使う（DADS の面の考え方: 影ではなく色の差で区切る）。
// title を渡すと section + aria-labelledby になる。

export type PanelProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
    children: ReactNode;
    title?: ReactNode;
    /** 見出しレベル（既定 h3。カードの中などページ構造に合わせる）。 */
    titleAs?: "h2" | "h3" | "h4";
    padding?: "md" | "sm";
};

const PADDING = { md: "p-4 md:p-6", sm: "p-4" } as const;

export function Panel({ children, title, titleAs: Heading = "h3", padding = "md", className, ...props }: PanelProps) {
    const headingId = useId();
    const Component = title ? "section" : "div";
    return (
        <Component
            className={cn("flex min-w-0 flex-col gap-3 rounded-8 bg-surface-muted text-text", PADDING[padding], className)}
            aria-labelledby={title ? headingId : undefined}
            {...props}
        >
            {title && (
                <Heading id={headingId} className="m-0 text-std-16B-170 text-text-strong">
                    {title}
                </Heading>
            )}
            {children}
        </Component>
    );
}
