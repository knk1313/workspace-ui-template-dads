import { useEffect, useId, useRef, useState, type KeyboardEvent, type Ref } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { useFormField, type FieldSize } from "./FormField";
import { Icon } from "./Icon";
import { CONTROL_HEIGHT, INPUT_CLASS } from "./Input";

// DADS コンボボックス（選択支援タイプ）。多くの選択肢を文字入力で絞り込んで 1 つ選ぶ。
// 選択肢が少なく絞り込みが不要ならセレクトボックスを使う（DADS）。
// WAI-ARIA APG「Editable Combobox With List Autocomplete」に従う:
//   input[role=combobox][aria-expanded][aria-controls][aria-autocomplete=list][aria-activedescendant]
//   + ul[role=listbox] > li[role=option][aria-selected]
// 入力で絞り込み、↓↑ で候補を移動（フォーカスは input に留め aria-activedescendant で示す）、Enter で確定、
// Esc で閉じる（入力内容は選択中の値に戻す）、外側クリック / Tab で閉じる。
// 候補の見た目はメニューリストボックスと同じ（枠 gray-420、角丸 8px、elevation-1、行の高さ 44px 以上）。

export type ComboboxOption = {
    value: string;
    label: string;
};

export type ComboboxProps = {
    options: ComboboxOption[];
    /** 選択中の値。未選択は ""。 */
    value: string;
    onChange: (value: string) => void;
    size?: FieldSize;
    /** 既定は親の幅いっぱい。 */
    block?: boolean;
    invalid?: boolean;
    /** 候補がないときのメッセージ。 */
    emptyMessage?: string;
    /** フォーム送信用の hidden input の name。 */
    name?: string;
    id?: string;
    /** FormField の外で使うときのアクセシブルネーム。 */
    "aria-label"?: string;
    autoComplete?: string;
    className?: string;
    ref?: Ref<HTMLInputElement>;
};

function normalize(text: string): string {
    // 全角英数字を半角に寄せ、大文字小文字を無視して部分一致させる
    return text
        .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
        .toLocaleLowerCase()
        .trim();
}

export function Combobox({
    options,
    value,
    onChange,
    size,
    block = true,
    invalid,
    emptyMessage = "該当する選択肢がありません",
    name,
    id,
    "aria-label": ariaLabel,
    autoComplete = "off",
    className,
    ref,
}: ComboboxProps) {
    const field = useFormField();
    const resolvedSize = size ?? field?.size ?? "md";
    const isInvalid = invalid ?? field?.invalid ?? false;
    const autoId = useId();
    const inputId = id ?? (field && !field.group ? field.id : autoId);
    const listId = `${inputId}-listbox`;

    const selected = options.find((o) => o.value === value);
    const [open, setOpen] = useState(false);
    // query は利用者が入力中の文字列。null のときは選択中のラベルをそのまま表示し、候補は絞り込まない。
    const [query, setQuery] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState(-1);
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const inputText = query ?? selected?.label ?? "";
    const filtered = query == null || normalize(query) === "" ? options : options.filter((o) => normalize(o.label).includes(normalize(query)));
    const activeOption = activeIndex >= 0 ? filtered[activeIndex] : undefined;
    const optionId = (i: number) => `${listId}-opt-${i}`;

    const close = () => {
        setOpen(false);
        setActiveIndex(-1);
    };

    const openList = (initialIndex?: number) => {
        setOpen(true);
        if (initialIndex != null) setActiveIndex(initialIndex);
        else {
            const selectedIndex = filtered.findIndex((o) => o.value === value);
            setActiveIndex(selectedIndex);
        }
    };

    const commit = (option: ComboboxOption) => {
        onChange(option.value);
        setQuery(null);
        close();
    };

    // 入力欄を離れたとき: 候補と一致しない文字列は捨てて選択中の値に戻す。空にしていたら未選択にする。
    const settle = () => {
        if (query != null) {
            const exact = options.find((o) => normalize(o.label) === normalize(query));
            if (exact) onChange(exact.value);
            else if (normalize(query) === "") onChange("");
            setQuery(null);
        }
        close();
    };

    // 外側クリックで閉じる
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: PointerEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) settle();
        };
        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    });

    // ハイライト中の候補が見えるようにスクロールする
    useEffect(() => {
        if (!open || activeIndex < 0) return;
        document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: "nearest" });
    });

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                if (!open) openList(filtered.length > 0 ? Math.max(0, filtered.findIndex((o) => o.value === value)) : -1);
                else if (filtered.length > 0) setActiveIndex((i) => (i + 1) % filtered.length);
                break;
            case "ArrowUp":
                e.preventDefault();
                if (!open) openList(filtered.length - 1);
                else if (filtered.length > 0) setActiveIndex((i) => (i <= 0 ? filtered.length - 1 : i - 1));
                break;
            case "Enter":
                if (open) {
                    e.preventDefault();
                    if (activeOption) commit(activeOption);
                    else settle();
                }
                break;
            case "Escape":
                if (open) {
                    e.preventDefault();
                    setQuery(null);
                    close();
                }
                break;
            case "Tab":
                settle();
                break;
        }
    };

    return (
        <div ref={rootRef} className={cn("relative", block ? "w-full" : "w-fit", className)}>
            <input
                ref={(el) => {
                    inputRef.current = el;
                    if (typeof ref === "function") ref(el);
                    else if (ref) ref.current = el;
                }}
                id={inputId}
                type="text"
                role="combobox"
                aria-expanded={open}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={open && activeOption ? optionId(activeIndex) : undefined}
                aria-describedby={field?.describedBy}
                aria-invalid={isInvalid || undefined}
                aria-required={field?.required ? true : undefined}
                aria-label={ariaLabel}
                autoComplete={autoComplete}
                value={inputText}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                    setActiveIndex(-1);
                }}
                onClick={() => {
                    if (!open) openList();
                }}
                onKeyDown={onKeyDown}
                className={cn(INPUT_CLASS, CONTROL_HEIGHT[resolvedSize], "w-full pr-12")}
            />
            {name && <input type="hidden" name={name} value={value} />}
            {/* 候補を開閉するボタン。マウス向けの補助なので Tab 順からは外す（APG）。 */}
            <button
                type="button"
                tabIndex={-1}
                aria-label="候補を開く"
                aria-expanded={open}
                aria-controls={listId}
                onClick={() => {
                    inputRef.current?.focus();
                    if (open) close();
                    else openList();
                }}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-8 text-text"
            >
                <Icon icon={ChevronDown} size="sm" className={cn("transition-transform", open && "rotate-180")} />
            </button>
            {/* 閉じているときも DOM に残す（aria-controls の参照先を保つ）。hidden 属性で非表示にする。 */}
            <div
                hidden={!open}
                className="absolute left-0 top-full z-30 mt-1 w-full min-w-fit rounded-8 border border-border bg-surface py-4 shadow-1 max-h-popup-max overflow-y-auto"
            >
                <ul id={listId} role="listbox" aria-label={ariaLabel} className="m-0 list-none p-0">
                    {filtered.map((o, i) => {
                        const isSelected = o.value === value;
                        const isActive = i === activeIndex;
                        return (
                            <li
                                key={o.value}
                                id={optionId(i)}
                                role="option"
                                aria-selected={isSelected}
                                // mousedown で入力欄のフォーカスが外れないようにし、click で確定する
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => commit(o)}
                                onMouseMove={() => {
                                    if (!isActive) setActiveIndex(i);
                                }}
                                className={cn(
                                    "flex min-h-11 cursor-pointer items-center px-4 py-2 text-16 leading-130 tracking-2 text-text-strong",
                                    isSelected && "bg-primary-surface-hover font-bold text-primary-hover",
                                    isActive && "bg-surface-muted underline underline-offset-3",
                                )}
                            >
                                {o.label}
                            </li>
                        );
                    })}
                </ul>
                {filtered.length === 0 && <p className="m-0 px-4 py-2 text-16 leading-130 text-text-muted">{emptyMessage}</p>}
            </div>
        </div>
    );
}
