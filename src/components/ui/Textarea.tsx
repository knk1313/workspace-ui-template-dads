import { useState, type ChangeEvent, type Ref, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { useFormField } from "./FormField";

// DADS テキストエリア（HTML 版 textarea.css）。
// 枠線 1px gray-600（hover で黒、エラーで error）、角丸 8px、パディング 16px、行高 1.7。伸縮は縦方向のみ（既定）。
// 項目ラベル・サポートテキスト・エラーテキストは FormField が担当し、id / aria-describedby / aria-invalid を受け取る。
// 文字数制限があるときは maxLength で入力を止めず（入力途中で消えると気付きにくい）、counterMax で
// 「n / max 文字」のカウンターを常時表示し、超過したらエラー色で超過文字数を知らせる（DADS「文字数に制限がある場合」）。

export type TextareaResize = "vertical" | "horizontal" | "both" | "none";

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "maxLength"> & {
    /** 伸縮の方向。既定は縦のみ。 */
    resize?: TextareaResize;
    /** 文字数カウンターの上限。指定すると「n / max 文字」を表示する（入力自体は制限しない）。 */
    counterMax?: number;
    /** 既定は親の幅いっぱい。false にして className で幅を指定できる。 */
    block?: boolean;
    invalid?: boolean;
    ref?: Ref<HTMLTextAreaElement>;
};

const RESIZE: Record<TextareaResize, string> = {
    vertical: "resize-y",
    horizontal: "resize-x",
    both: "resize",
    none: "resize-none",
};

export const TEXTAREA_CLASS =
    "block box-border max-w-full rounded-8 border border-border-strong bg-surface p-4 text-16 leading-170 tracking-2 text-text-strong hover:border-border-emphasis focus-visible:focus-ring aria-invalid:border-error aria-invalid:hover:border-error-hover disabled:resize-none disabled:border-border-disabled disabled:bg-disabled-surface disabled:text-text-disabled disabled:hover:border-border-disabled read-only:border-dashed";

/** 文字数はサロゲートペア（絵文字など）を 1 文字として数える。 */
function countChars(text: string): number {
    return Array.from(text).length;
}

export function Textarea({
    resize = "vertical",
    counterMax,
    block = true,
    invalid,
    className,
    id,
    rows = 4,
    required,
    value,
    defaultValue,
    onChange,
    ...props
}: TextareaProps) {
    const field = useFormField();
    const isInvalid = invalid ?? field?.invalid ?? false;
    const resolvedId = id ?? (field && !field.group ? field.id : undefined);
    const counterId = resolvedId ? `${resolvedId}-counter` : undefined;

    // 非制御のときはカウンターのために入力内容を内部で追う。制御のときは value をそのまま数える。
    const [uncontrolledText, setUncontrolledText] = useState(() => (defaultValue == null ? "" : String(defaultValue)));
    const currentText = value != null ? String(value) : uncontrolledText;
    const count = countChars(currentText);
    const exceeded = counterMax != null && count > counterMax;

    const describedBy = [props["aria-describedby"] ?? field?.describedBy, counterMax != null ? counterId : null].filter(Boolean).join(" ") || undefined;

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (value == null) setUncontrolledText(e.target.value);
        onChange?.(e);
    };

    const textarea = (
        <textarea
            id={resolvedId}
            rows={rows}
            aria-describedby={describedBy}
            aria-invalid={isInvalid || undefined}
            aria-required={required ?? field?.required ? true : undefined}
            className={cn(TEXTAREA_CLASS, RESIZE[resize], block ? "w-full" : "", className)}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            {...props}
        />
    );

    if (counterMax == null) return textarea;

    return (
        <div className={cn(block ? "w-full" : "w-fit max-w-full")}>
            {textarea}
            <p id={counterId} className={cn("m-0 mt-2 text-16 leading-none tracking-2 nums", exceeded ? "text-error" : "text-text-muted")}>
                {count} / {counterMax}文字{exceeded && `（${count - counterMax}文字超過）`}
            </p>
        </div>
    );
}
