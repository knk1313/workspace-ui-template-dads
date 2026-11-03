import { useId, type FormEvent, type Ref } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { type FieldSize } from "./FormField";
import { Icon } from "./Icon";
import { CONTROL_HEIGHT, INPUT_CLASS } from "./Input";

// DADS 検索ボックス（HTML 版 search-box.css）。
// <form role="search"> の中に、左に虫眼鏡（24px、gray-600）を重ねた type="search" の入力欄と「検索」ボタン（塗り）を置く。
// ラベルは視覚的に隠してもよいが必ず付ける。ブラウザ標準の消去ボタンは隠し、必要なら onClear で消去ボタンを出す。
// テーブルの行の絞り込みにはテーブルコントロールを使う（DADS）。

export type SearchBoxProps = {
    /** 入力欄のラベル（スクリーンリーダー向け。既定は視覚的に隠す）。 */
    label: string;
    /** ラベルを表示する。 */
    showLabel?: boolean;
    value: string;
    onChange: (value: string) => void;
    /** 送信（Enter または検索ボタン）。 */
    onSubmit?: (value: string) => void;
    /** 指定すると入力があるときに消去ボタンを表示する。 */
    onClear?: () => void;
    /** 送信ボタンのラベル。 */
    buttonLabel?: string;
    size?: FieldSize;
    name?: string;
    id?: string;
    autoComplete?: string;
    className?: string;
    ref?: Ref<HTMLInputElement>;
};

const BUTTON_SIZE: Record<FieldSize, "sm" | "md" | "lg"> = { sm: "sm", md: "md", lg: "lg" };

export function SearchBox({
    label,
    showLabel = false,
    value,
    onChange,
    onSubmit,
    onClear,
    buttonLabel = "検索",
    size = "md",
    name = "q",
    id,
    autoComplete = "off",
    className,
    ref,
}: SearchBoxProps) {
    const autoId = useId();
    const inputId = id ?? autoId;

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit?.(value);
    };

    return (
        <form role="search" onSubmit={handleSubmit} className={cn("flex flex-col gap-2", className)}>
            <label htmlFor={inputId} className={cn("text-16 font-bold leading-170 tracking-2 text-text", !showLabel && "sr-only")}>
                {label}
            </label>
            <div className="flex items-center gap-4">
                <div className="relative flex min-w-0 flex-1">
                    <Icon icon={Search} size="lg" className="pointer-events-none absolute inset-y-0 left-4 z-10 my-auto text-text-muted" />
                    <input
                        ref={ref}
                        id={inputId}
                        type="search"
                        name={name}
                        value={value}
                        autoComplete={autoComplete}
                        onChange={(e) => onChange(e.target.value)}
                        className={cn(INPUT_CLASS, CONTROL_HEIGHT[size], "w-full min-w-0 pl-12 [&::-webkit-search-cancel-button]:appearance-none", onClear && value && "pr-12")}
                    />
                    {onClear && value && (
                        <button
                            type="button"
                            aria-label="入力内容を消去"
                            onClick={onClear}
                            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-8 text-text hover:bg-surface-muted focus-visible:focus-ring"
                        >
                            <Icon icon={X} size="md" />
                        </button>
                    )}
                </div>
                <Button type="submit" size={BUTTON_SIZE[size]}>
                    {buttonLabel}
                </Button>
            </div>
        </form>
    );
}
