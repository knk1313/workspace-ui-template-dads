import type { HTMLAttributes, ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";
import { Link } from "./Link";

// DADS チップタグ（https://design.digital.go.jp/dads/components/chip-tag/）。
// ユーザーが選択・入力した値（絞り込み条件、宛先など）をアイテムにして並べ、個別に外せるようにする。
// 状態や分類を示すときはチップラベルを使う。削除が取り消せない場面では使わない（チェックボックスを検討する）。
// 高さ 32px の丸いチップ。削除ボタンは 32px の見た目に見えない 44px のタップ領域を重ねる。

export type ChipTagProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
    label: string;
    /** 削除ボタンを表示し、押されたときに呼ぶ。 */
    onRemove?: () => void;
    /** ラベルをリンクにする（絞り込み条件のページなど）。 */
    href?: string;
    /** 先頭に置くアバターやアイコン（人物を示すときなど）。 */
    leading?: ReactNode;
};

export function ChipTag({ label, onRemove, href, leading, className, ...props }: ChipTagProps) {
    return (
        <span
            className={cn(
                "inline-flex min-h-8 max-w-full items-center gap-1 rounded-full border border-border bg-surface text-16 leading-none tracking-2 text-text",
                leading ? "pl-1" : "pl-3",
                onRemove ? "pr-1" : "pr-3",
                className,
            )}
            {...props}
        >
            {leading && <span className="flex shrink-0 items-center">{leading}</span>}
            {href ? (
                <Link to={href} className="py-1 break-words">
                    {label}
                </Link>
            ) : (
                <span className="py-1 break-words">{label}</span>
            )}
            {onRemove && (
                <button
                    type="button"
                    aria-label={`${label} を削除`}
                    onClick={onRemove}
                    className="tap-area flex size-6 shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 text-text hover:bg-surface-muted focus-visible:focus-ring after:w-target"
                >
                    <Icon icon={X} size="md" />
                </button>
            )}
        </span>
    );
}
