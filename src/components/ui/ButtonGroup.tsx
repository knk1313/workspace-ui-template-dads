import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

// DADS ボタンの配置ルール。
//   - 進行方向は右: 確定（プライマリー）を右端、キャンセル（ターシャリー）を左端に置く → align="end" で DOM 順のまま右寄せ。
//   - ボタン同士の間隔は 16px、縦に積むときは 8px。
//   - モバイル（md 未満）では縦に積み、幅いっぱいにする。右寄せ配置では「確定が上」になるよう順序を反転する。

export type ButtonGroupAlign = "end" | "start" | "center";
export type ButtonGroupDirection = "row" | "column";

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
    children: ReactNode;
    /** 横並びのときの寄せ。end（既定）= 右寄せ（確定が右端）。 */
    align?: ButtonGroupAlign;
    direction?: ButtonGroupDirection;
    /** md 未満で縦に積み、ボタンを幅いっぱいにする（既定 true）。 */
    stackOnMobile?: boolean;
};

const ROW_ALIGN: Record<ButtonGroupAlign, string> = {
    end: "justify-end",
    start: "justify-start",
    center: "justify-center",
};

const COLUMN_ALIGN: Record<ButtonGroupAlign, string> = {
    end: "items-end",
    start: "items-start",
    center: "items-center",
};

export function ButtonGroup({ children, align = "end", direction = "row", stackOnMobile = true, className, ...props }: ButtonGroupProps) {
    const column = direction === "column";
    return (
        <div
            className={cn(
                "flex",
                column
                    ? cn("flex-col gap-2", COLUMN_ALIGN[align])
                    : stackOnMobile
                      ? cn(
                            // モバイルは縦積み。右寄せ（確定が DOM の末尾）では確定を上に出すため順序を反転する。
                            align === "end" ? "flex-col-reverse" : "flex-col",
                            "gap-2 md:flex-row md:flex-wrap md:items-center md:gap-4",
                            ROW_ALIGN[align],
                        )
                      : cn("flex-row flex-wrap items-center gap-4", ROW_ALIGN[align]),
                // モバイルの縦積み中はボタンを幅いっぱいにする（Button の w-fit より後に出力されるので上書きできる）。
                // direction="column" は寄せを保つため幅を強制しない（幅いっぱいにしたいときは Button の block を使う）。
                !column && stackOnMobile && "max-md:[&>*]:w-full",
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}
