import { useEffect, useRef, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/cn";
import { useFormField, type FieldSize } from "./FormField";

// DADS チェックボックス（HTML 版 checkbox.css）。ネイティブの <input type="checkbox"> を使う。
// サイズ sm 24 / md 32 / lg 44（枠 2〜3px）。チェック済みは key-900 の塗り、hover で key-1100。
// ラベル付きのときは上下 8px の余白で 44px のタップ領域を確保する。
// 複数のチェックボックスは FormField as="fieldset" でグループ化する。

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type" | "children"> & {
    /** ラベル。省略時は aria-label を必ず渡す。 */
    children?: ReactNode;
    size?: FieldSize;
    /** 一部だけ選択された状態（表の全選択など）。 */
    indeterminate?: boolean;
    invalid?: boolean;
    ref?: Ref<HTMLInputElement>;
};

const BOX: Record<FieldSize, { box: string; input: string; icon: string; gap: string; label: string; border: string; pad: string }> = {
    sm: { box: "size-6", input: "size-4.5 border-2", icon: "size-3.5", gap: "gap-1", label: "text-16", border: "border-2", pad: "py-2" },
    md: { box: "size-8", input: "size-6 border-2", icon: "size-5", gap: "gap-2", label: "text-16", border: "border-2", pad: "py-2" },
    lg: { box: "size-11", input: "size-8 border-3", icon: "size-6", gap: "gap-2", label: "text-17", border: "border-3", pad: "py-3" },
};

export function Checkbox({ children, size, indeterminate = false, invalid, className, disabled, ref, ...props }: CheckboxProps) {
    const field = useFormField();
    const resolvedSize = size ?? field?.size ?? "sm";
    const isInvalid = invalid ?? field?.invalid ?? false;
    const innerRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (innerRef.current) innerRef.current.indeterminate = indeterminate;
    }, [indeterminate]);

    const s = BOX[resolvedSize];

    return (
        <label className={cn("inline-flex w-fit items-start leading-130 tracking-0", s.label, s.gap, children ? s.pad : "", disabled ? "" : "cursor-pointer", className)}>
            {/* ラベル 1 行分の高さの枠で箱を上下中央に置き、何行になっても 1 行目の中央に箱をそろえる。 */}
            <span className={cn("flex shrink-0 items-center", children && "h-lh")}>
                <span
                    className={cn(
                        "relative flex shrink-0 items-center justify-center rounded-4",
                        s.box,
                        !disabled && "hover:bg-text-disabled",
                    )}
                >
                    <input
                        ref={(el) => {
                            innerRef.current = el;
                            if (typeof ref === "function") ref(el);
                            else if (ref) ref.current = el;
                        }}
                        type="checkbox"
                        id={field && !field.group ? field.id : undefined}
                        disabled={disabled}
                        aria-invalid={isInvalid || undefined}
                        aria-describedby={props["aria-describedby"] ?? field?.describedBy}
                        className={cn(
                            "peer m-0 appearance-none rounded-4 border-solid bg-surface bg-clip-padding",
                            s.input,
                            isInvalid ? "border-error hover:border-error-hover checked:border-error checked:bg-error indeterminate:border-error indeterminate:bg-error" : "border-border-strong hover:border-border-emphasis checked:border-primary checked:bg-primary checked:hover:border-primary-strong checked:hover:bg-primary-strong indeterminate:border-primary indeterminate:bg-primary",
                            "focus-visible:focus-ring",
                            "disabled:border-border-disabled disabled:bg-disabled-surface disabled:checked:bg-disabled disabled:checked:border-disabled disabled:hover:border-border-disabled",
                        )}
                        {...props}
                    />
                    <Check
                        aria-hidden="true"
                        strokeWidth={3}
                        className={cn("pointer-events-none absolute hidden text-text-inverse peer-checked:block peer-indeterminate:hidden", s.icon)}
                    />
                    <Minus aria-hidden="true" strokeWidth={3} className={cn("pointer-events-none absolute hidden text-text-inverse peer-indeterminate:block", s.icon)} />
                </span>
            </span>
            {children && <span className={cn(disabled ? "text-text-disabled" : "text-text")}>{children}</span>}
        </label>
    );
}
