import { cn } from "@/lib/cn";

// 読み込み中のプレースホルダー。実際の内容と同じ場所・大きさに置き、レイアウトのずれを防ぐ。
// 装飾なので aria-hidden にし、読み込み中であることは親要素の aria-busy と Spinner（role="status"）で伝える。
//   <section aria-busy={loading}>{loading ? <Skeleton lines={3} /> : <p>…</p>}</section>

export type SkeletonVariant = "text" | "rect" | "circle";

export type SkeletonProps = {
    variant?: SkeletonVariant;
    /** text のときの行数。最後の行は短くする。 */
    lines?: number;
    /** 幅・高さは className で指定する（例: "h-40 w-full"、"size-12"）。 */
    className?: string;
};

const BASE = "animate-pulse bg-solid-gray-100 motion-reduce:animate-none";

export function Skeleton({ variant = "text", lines = 1, className }: SkeletonProps) {
    if (variant === "text") {
        return (
            <div aria-hidden="true" className={cn("flex flex-col gap-2", className)}>
                {Array.from({ length: lines }, (_, i) => (
                    <div key={i} data-skeleton="" className={cn(BASE, "h-4 rounded-4", lines > 1 && i === lines - 1 ? "w-2/3" : "w-full")} />
                ))}
            </div>
        );
    }
    return <div aria-hidden="true" data-skeleton="" className={cn(BASE, variant === "circle" ? "rounded-full" : "rounded-8", className)} />;
}

export type SkeletonTableProps = {
    rows?: number;
    columns?: number;
    className?: string;
};

/** 表の読み込み中。ヘッダー行 + rows 行 × columns 列。 */
export function SkeletonTable({ rows = 5, columns = 4, className }: SkeletonTableProps) {
    return (
        <div aria-hidden="true" className={cn("flex flex-col", className)}>
            <div className="flex gap-4 border-b-2 border-border-emphasis bg-surface-strong px-4 py-3">
                {Array.from({ length: columns }, (_, c) => (
                    <div key={c} className={cn(BASE, "h-4 flex-1 rounded-4")} />
                ))}
            </div>
            {Array.from({ length: rows }, (_, r) => (
                <div key={r} className="flex gap-4 border-b border-border px-4 py-5">
                    {Array.from({ length: columns }, (_, c) => (
                        <div key={c} className={cn(BASE, "h-4 flex-1 rounded-4", c === 0 && "max-w-40")} />
                    ))}
                </div>
            ))}
        </div>
    );
}
