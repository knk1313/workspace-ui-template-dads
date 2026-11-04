import { useId, type ButtonHTMLAttributes, type ReactNode, type Ref } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

// DADS スイッチ（On/Off、HTML 版 switch-on-off.css）。切り替えた結果がその場で反映される設定に使う。
// 保存ボタンで確定する項目や、結果がすぐ分からない項目にはチェックボックスを使う（DADS）。
// <button role="switch" aria-checked> で実装し、Space / Enter はネイティブのクリックとして扱う。
// トラック 56px・枠 2px・パディング 4px、サム 24px（高さ 36px。上下の見えない領域で 44px のタップ領域を確保）。
// Off: 枠 gray-600 / サム gray-800、On: トラック key-50 / 枠とサム key-900 / サムにチェック。
// hover: 枠とサムが黒（On は key-1100）+ 4px の灰色リング、active は 6px。
// ラベルは左に置き、<label for> と aria-labelledby の両方で関連付ける。

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "children" | "type"> & {
    checked: boolean;
    onChange: (checked: boolean) => void;
    /** 左に表示するラベル。設定項目の名前を書く（「有効にする」のような動詞は避ける）。 */
    label: ReactNode;
    /** ラベルを視覚的に隠す（表の行など文脈でわかる場合）。 */
    hideLabel?: boolean;
    className?: string;
    ref?: Ref<HTMLButtonElement>;
};

export function Switch({ checked, onChange, label, hideLabel = false, className, id, disabled, onClick, ...props }: SwitchProps) {
    const autoId = useId();
    const buttonId = id ?? autoId;
    const labelId = `${buttonId}-label`;

    return (
        <span className={cn("inline-flex items-center gap-4", className)}>
            <label id={labelId} htmlFor={buttonId} className={cn("text-16 leading-130 tracking-0", disabled ? "text-text-disabled" : "text-text", hideLabel && "sr-only")}>
                {label}
            </label>
            <button
                type="button"
                role="switch"
                id={buttonId}
                aria-checked={checked}
                aria-labelledby={labelId}
                disabled={disabled}
                onClick={(e) => {
                    onClick?.(e);
                    if (!e.defaultPrevented) onChange(!checked);
                }}
                className={cn(
                    "group relative shrink-0 rounded-full border-0 bg-transparent p-0 select-none focus-visible:focus-ring",
                    // 上下 4px ずつ見えない領域を足して 44px のタップ領域にする
                    "before:absolute before:inset-x-0 before:-inset-y-1",
                )}
                {...props}
            >
                <span
                    className={cn(
                        "box-border block w-14 rounded-full border-2 p-1 transition-colors",
                        "border-border-strong bg-surface group-hover:border-border-emphasis group-hover:ring-4 group-hover:ring-control-hover group-active:ring-6 group-active:ring-control-active",
                        "group-aria-checked:border-primary group-aria-checked:bg-primary-surface group-aria-checked:group-hover:border-primary-strong",
                        "group-disabled:border-border-disabled group-disabled:bg-disabled-surface group-disabled:ring-0",
                    )}
                >
                    <span
                        className={cn(
                            "flex size-6 items-center justify-center rounded-full transition-[margin,background-color]",
                            "bg-text group-hover:bg-border-emphasis",
                            "group-aria-checked:ml-auto group-aria-checked:bg-primary group-aria-checked:group-hover:bg-primary-strong",
                            "group-disabled:bg-disabled",
                        )}
                    >
                        <Check aria-hidden="true" focusable="false" className="hidden size-6 text-text-inverse group-aria-checked:block" />
                    </span>
                </span>
            </button>
        </span>
    );
}
