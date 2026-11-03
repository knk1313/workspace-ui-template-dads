import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

// フォームのレイアウト。DADS にはレイアウト部品の規定がないため、フォーム（入力項目の縦積み）の慣例に従う。
//   FormLayout: 項目を縦に積む。columns=2 で md 以上を 2 列にする（短い項目を並べるときだけ使う）。
//   FormSection: 見出し + 説明 + 項目のまとまり（<section aria-labelledby>）。
//     layout="settings" は設定画面向けで、md 以上は左 1/3 に見出し・説明、右 2/3 に項目を置く。
// 2 列の中で幅いっぱいにしたい項目は className="md:col-span-2" を付ける。

export type FormLayoutProps = {
    children: ReactNode;
    /** 列数。2 のとき md 以上で 2 列になる。 */
    columns?: 1 | 2;
    /** 項目の間隔。 */
    gap?: "sm" | "md" | "lg";
    className?: string;
};

const GAP: Record<NonNullable<FormLayoutProps["gap"]>, string> = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
};

export function FormLayout({ children, columns = 1, gap = "md", className }: FormLayoutProps) {
    return <div className={cn("grid grid-cols-1 items-start", columns === 2 && "md:grid-cols-2 md:gap-x-6", GAP[gap], className)}>{children}</div>;
}

export type FormSectionProps = {
    title: ReactNode;
    description?: ReactNode;
    children: ReactNode;
    /** stack: 見出しの下に項目を積む。settings: md 以上で見出し・説明を左、項目を右に置く。 */
    layout?: "stack" | "settings";
    /** 見出しのレベル。ページの構造に合わせる。 */
    headingLevel?: 2 | 3 | 4;
    id?: string;
    className?: string;
};

export function FormSection({ title, description, children, layout = "stack", headingLevel = 2, id, className }: FormSectionProps) {
    const autoId = useId();
    const headingId = `${id ?? autoId}-heading`;
    const Heading = `h${headingLevel}` as const;
    const settings = layout === "settings";

    return (
        <section id={id} aria-labelledby={headingId} className={cn("flex flex-col gap-6", settings && "md:grid md:grid-cols-3 md:gap-x-8", className)}>
            <div className={cn("flex flex-col gap-2", settings && "md:col-span-1")}>
                <Heading id={headingId} className="m-0 text-std-20B-150 text-text-strong">
                    {title}
                </Heading>
                {description && <p className="m-0 text-16 leading-170 tracking-2 text-text-muted">{description}</p>}
            </div>
            <div className={cn("flex min-w-0 flex-col gap-6", settings && "md:col-span-2")}>{children}</div>
        </section>
    );
}
