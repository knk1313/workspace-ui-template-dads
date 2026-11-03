import { Children, type ReactNode } from "react";
import { cn } from "@/lib/cn";

// フォーム下部のアクション領域。DADS ボタンの配置ルールに従う:
//   確定（プライマリー）は右端、キャンセル（ターシャリー = テキストボタン）は左端、セカンダリーは確定の左。
//   プライマリーは 1 つ、セカンダリーは最大 3 つ、ターシャリーはキャンセル用に 1 つ。
// DOM 順 = 見た目の順 = フォーカス順（キャンセル → セカンダリー → プライマリー）。モバイルでも同じ並びにし、
// 収まらないときだけ折り返す（折り返しても確定側は右に寄せる）。
// sticky を付けると画面下部に固定する（長いフォームで常に確定ボタンが見える）。

export type ActionPanelProps = {
    /** 確定ボタン（Button の solid-fill）。 */
    primary: ReactNode;
    /** セカンダリーボタン（outline）。複数ある場合は配列で渡す。 */
    secondary?: ReactNode;
    /** キャンセル（text ボタン）。 */
    cancel?: ReactNode;
    /** 画面下部に固定する。"md" は md 以上だけ固定（モバイルでは縦積みのボタンが画面を覆いすぎるため）。 */
    sticky?: boolean | "md";
    /** 領域の名前（role="group" の aria-label）。 */
    label?: string;
    className?: string;
};


export function ActionPanel({ primary, secondary, cancel, sticky = false, label = "操作", className }: ActionPanelProps) {
    const secondaries = Children.toArray(secondary);
    return (
        <div
            role="group"
            aria-label={label}
            className={cn(
                "flex flex-wrap items-center gap-x-4 gap-y-2",
                sticky === true && "sticky bottom-0 z-10 border-t border-border bg-surface py-4",
                sticky === "md" && "md:sticky md:bottom-0 md:z-10 md:border-t md:border-border md:bg-surface md:py-4",
                className,
            )}
        >
            {cancel && <div className="flex">{cancel}</div>}
            <div className="ml-auto flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
                {secondaries}
                {primary}
            </div>
        </div>
    );
}
