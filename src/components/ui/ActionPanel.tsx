import { Children, type ReactNode } from "react";
import { cn } from "@/lib/cn";

// フォーム下部のアクション領域。DADS ボタンの配置ルールに従う:
//   確定（プライマリー）は右端、キャンセル（ターシャリー = テキストボタン）は左端、セカンダリーは確定の左。
//   プライマリーは 1 つ、セカンダリーは最大 3 つ、ターシャリーはキャンセル用に 1 つ。
// モバイル（md 未満）は縦積みで、DOM 順 = 意味順（セカンダリー → プライマリー → ターシャリー）。
// md 以上の並びは CSS の order で変えるだけなので、フォーカス順は常に DOM 順。
// sticky を付けると画面下部に固定する（長いフォームで常に確定ボタンが見える）。

export type ActionPanelProps = {
    /** 確定ボタン（Button の solid-fill）。 */
    primary: ReactNode;
    /** セカンダリーボタン（outline）。複数ある場合は配列で渡す。 */
    secondary?: ReactNode;
    /** キャンセル（text ボタン）。 */
    cancel?: ReactNode;
    /** 画面下部に固定する。 */
    sticky?: boolean;
    /** 領域の名前（role="group" の aria-label）。 */
    label?: string;
    className?: string;
};

// モバイルでは各ボタンを幅いっぱいにし、md 以上で元の幅に戻す
const SLOT = "flex flex-col gap-2 *:w-full md:flex-row md:items-center md:gap-4 md:*:w-auto";

export function ActionPanel({ primary, secondary, cancel, sticky = false, label = "操作", className }: ActionPanelProps) {
    const secondaries = Children.toArray(secondary);
    return (
        <div
            role="group"
            aria-label={label}
            className={cn(
                "flex flex-col gap-2 md:flex-row md:items-center md:justify-end md:gap-4",
                sticky && "sticky bottom-0 z-10 border-t border-border bg-surface py-4",
                className,
            )}
        >
            {secondaries.length > 0 && <div className={cn(SLOT, "md:order-2")}>{secondaries}</div>}
            <div className={cn(SLOT, "md:order-3")}>{primary}</div>
            {cancel && <div className={cn(SLOT, "md:order-1 md:mr-auto")}>{cancel}</div>}
        </div>
    );
}
