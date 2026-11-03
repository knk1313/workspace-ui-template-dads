import type { ReactNode, Ref, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { useFormField, type FieldSize } from "./FormField";
import { Icon } from "./Icon";
import { CONTROL_HEIGHT } from "./Input";

// DADS セレクトボックス（HTML 版 select.css）。ネイティブの <select> に右端のシェブロンを重ねる。
// 高さ sm 40 / md 48 / lg 56、左パディング 16px、右パディング 40px（シェブロンの分）、枠線 1px gray-600、角丸 8px。
// 展開時のリストは OS 標準の UI を使う（DADS の規定）。選択肢が 5 つ以下ならラジオボタンを検討する。
// 幅は既定で内容に合わせる（DADS: fit-content）。フォーム内で揃えたいときは block を付ける。

export type SelectOption = {
    value: string;
    label: string;
    disabled?: boolean;
};

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
    size?: FieldSize;
    /** 選択肢。children で <option> を直接書いてもよい。 */
    options?: SelectOption[];
    /** 未選択を表す先頭の選択肢（value=""）。任意項目で使う。 */
    placeholder?: string;
    /** 親の幅いっぱいに広げる。 */
    block?: boolean;
    invalid?: boolean;
    children?: ReactNode;
    ref?: Ref<HTMLSelectElement>;
};

export const SELECT_CLASS =
    "peer box-border max-w-full appearance-none rounded-8 border border-border-strong bg-surface pl-4 pr-10 text-16 leading-none tracking-2 text-text-strong hover:border-border-emphasis focus-visible:focus-ring aria-invalid:border-error aria-invalid:hover:border-error-hover disabled:border-border-disabled disabled:bg-disabled-surface disabled:text-text-disabled disabled:hover:border-border-disabled";

export function Select({ size, options, placeholder, block = false, invalid, className, id, required, children, ...props }: SelectProps) {
    const field = useFormField();
    const resolvedSize = size ?? field?.size ?? "md";
    const isInvalid = invalid ?? field?.invalid ?? false;

    return (
        <span className={cn("relative block max-w-full", block ? "w-full" : "w-fit", className)}>
            <select
                id={id ?? (field && !field.group ? field.id : undefined)}
                aria-describedby={props["aria-describedby"] ?? field?.describedBy}
                aria-invalid={isInvalid || undefined}
                aria-required={required ?? field?.required ? true : undefined}
                className={cn(SELECT_CLASS, CONTROL_HEIGHT[resolvedSize], block ? "w-full" : "")}
                {...props}
            >
                {placeholder != null && <option value="">{placeholder}</option>}
                {options?.map((o) => (
                    <option key={o.value} value={o.value} disabled={o.disabled}>
                        {o.label}
                    </option>
                ))}
                {children}
            </select>
            {/* シェブロンは装飾。クリックを select に通すため pointer-events を切る。無効時は文字と同じ色にする。 */}
            <Icon icon={ChevronDown} size="sm" className="pointer-events-none absolute inset-y-0 right-4 my-auto text-text peer-disabled:text-text-disabled" />
        </span>
    );
}
