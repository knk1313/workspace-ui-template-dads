import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { ChevronDown, EllipsisVertical, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// DADS メニューリストボックス（HTML 版 menu-list-box.css / menu-list.css）+ WAI-ARIA APG の Menu Button パターン。
// 行の「その他の操作」や並べ替えの選択など、アクションの一覧をドロップダウンで出す。
//   トリガー: <button aria-haspopup="menu" aria-expanded aria-controls>（label + シェブロン、または縦三点リーダーのアイコンのみ）
//   ポップアップ: role="menu"（枠 gray-420、角丸 8px、elevation-1、上下 16px、最大 6.5 行でスクロール）
//   項目: role="menuitem"（高さ 44px、hover で gray-50 + 下線、danger はエラー色、disabled は aria-disabled）
// キーボード: ↓↑ で移動（端で折り返す）、Home / End、Enter / Space で実行、Esc で閉じてトリガーへ、Tab で閉じる、文字で先頭一致。
// 外側クリックで閉じる。画面の下端で見切れるときは上に開く。

export type DropdownMenuItem = {
    label: string;
    onSelect: () => void;
    icon?: LucideIcon;
    /** 削除など取り消せない操作。エラー色にする。 */
    danger?: boolean;
    /** 実行できない項目。Tab と矢印キーでは到達でき、理由は近くに書く。 */
    disabled?: boolean;
};

export type DropdownMenuEntry = DropdownMenuItem | "separator";

export type DropdownMenuTriggerStyle = "text" | "outlined" | "filled";

export type DropdownMenuProps = {
    /** トリガーのラベル。iconOnly のときは aria-label になる。 */
    label: string;
    items: DropdownMenuEntry[];
    style?: DropdownMenuTriggerStyle;
    size?: "sm" | "md";
    /** ラベルの前に置くアイコン。 */
    icon?: LucideIcon;
    /** 縦三点リーダーのアイコンだけのトリガーにする（label は aria-label として必須）。 */
    iconOnly?: boolean;
    /** ポップアップを揃える端。トリガーの左端（start）か右端（end）。 */
    align?: "start" | "end";
    id?: string;
    className?: string;
    /** トリガーの追加クラス。 */
    triggerClassName?: string;
};

const TRIGGER_STYLE: Record<DropdownMenuTriggerStyle, string> = {
    text: "bg-transparent hover:bg-surface-muted",
    outlined: "border border-border bg-surface hover:border-border-emphasis hover:bg-surface-muted",
    filled: "bg-surface-muted hover:bg-surface-strong",
};

const TRIGGER_SIZE: Record<"sm" | "md", string> = {
    sm: "tap-area min-h-9 gap-1 px-1",
    md: "min-h-11 gap-2 px-4",
};

function isItem(entry: DropdownMenuEntry): entry is DropdownMenuItem {
    return entry !== "separator";
}

export function DropdownMenu({ label, items, style = "text", size = "md", icon, iconOnly = false, align = "start", id, className, triggerClassName }: DropdownMenuProps) {
    const autoId = useId();
    const menuId = `${id ?? autoId}-menu`;
    const [open, setOpen] = useState(false);
    // 画面の下端に近いトリガーだとメニューが見切れるので、その場合だけ上向きに開く。
    const [dropUp, setDropUp] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    // 開いたときに最初（↓・クリック）か最後（↑）の項目へフォーカスする。
    const pendingFocus = useRef<"first" | "last" | null>(null);
    const typeahead = useRef({ text: "", at: 0 });

    function itemElements(): HTMLElement[] {
        return Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    }

    function openMenu(focus: "first" | "last") {
        pendingFocus.current = focus;
        setOpen(true);
    }

    function closeMenu(restoreFocus: boolean) {
        setOpen(false);
        if (restoreFocus) triggerRef.current?.focus();
    }

    useLayoutEffect(() => {
        if (!open) return;
        const trigger = triggerRef.current?.getBoundingClientRect();
        const menuHeight = menuRef.current?.offsetHeight ?? 0;
        if (trigger) {
            const GAP = 4;
            const overflowsBelow = trigger.bottom + GAP + menuHeight > window.innerHeight;
            const fitsAbove = trigger.top - GAP - menuHeight > 0;
            setDropUp(overflowsBelow && fitsAbove);
        }
        const els = itemElements();
        (pendingFocus.current === "last" ? els[els.length - 1] : els[0])?.focus();
        pendingFocus.current = null;
    }, [open]);

    useEffect(() => {
        if (!open) return;
        function onDown(e: MouseEvent) {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [open]);

    function onTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openMenu("first");
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            openMenu("last");
        }
    }

    function select(item: DropdownMenuItem) {
        if (item.disabled) return;
        closeMenu(true);
        item.onSelect();
    }

    function onMenuKeyDown(e: KeyboardEvent<HTMLDivElement>) {
        const els = itemElements();
        const index = els.indexOf(document.activeElement as HTMLElement);
        const focusAt = (i: number) => els[(i + els.length) % els.length]?.focus();
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                focusAt(index + 1);
                return;
            case "ArrowUp":
                e.preventDefault();
                focusAt(index - 1);
                return;
            case "Home":
                e.preventDefault();
                focusAt(0);
                return;
            case "End":
                e.preventDefault();
                focusAt(els.length - 1);
                return;
            case "Escape":
                e.preventDefault();
                e.stopPropagation();
                closeMenu(true);
                return;
            case "Tab":
                // Tab は閉じるだけで、フォーカスは通常どおり次の要素へ移る。
                // 項目は閉じると消えるので、先にトリガーへ戻し、既定の Tab 移動がトリガーの次から始まるようにする。
                triggerRef.current?.focus();
                setOpen(false);
                return;
        }
        // 1 文字の入力で、その文字で始まる次の項目へ移る（続けて打つと複数文字で一致させる）。
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && e.key !== " ") {
            e.preventDefault();
            // Date.now() ではなくイベントの時刻を使う（純粋でない関数を描画中に呼ばないため）。
            const now = e.timeStamp;
            const text = (now - typeahead.current.at < 500 ? typeahead.current.text : "") + e.key.toLowerCase();
            typeahead.current = { text, at: now };
            const labels = els.map((el) => (el.textContent ?? "").trim().toLowerCase());
            const find = (query: string, start: number) => {
                for (let step = 0; step < els.length; step++) {
                    const i = (start + step + els.length) % els.length;
                    if (labels[i].startsWith(query)) return i;
                }
                return -1;
            };
            // 複数文字で一致しなければ、今打った 1 文字だけで探し直す（別の項目へ移りたいとき）。
            let found = text.length > 1 ? find(text, index) : -1;
            if (found < 0) {
                found = find(e.key.toLowerCase(), index + 1);
                typeahead.current = { text: e.key.toLowerCase(), at: now };
            }
            if (found >= 0) els[found].focus();
        }
    }

    return (
        <div ref={rootRef} className={cn("relative inline-block", className)}>
            <button
                ref={triggerRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={open ? menuId : undefined}
                aria-label={iconOnly ? label : undefined}
                onClick={() => (open ? closeMenu(false) : openMenu("first"))}
                onKeyDown={onTriggerKeyDown}
                className={cn(
                    "inline-flex items-center justify-center text-16 leading-120 tracking-2 text-text-strong focus-visible:focus-ring-fill",
                    iconOnly ? "size-target rounded-8" : cn("rounded-8 py-1 hover:underline hover:underline-offset-3", TRIGGER_SIZE[size]),
                    TRIGGER_STYLE[style],
                    triggerClassName,
                )}
            >
                {iconOnly ? (
                    <Icon icon={icon ?? EllipsisVertical} size="lg" />
                ) : (
                    <>
                        {icon && <Icon icon={icon} size="md" />}
                        <span>{label}</span>
                        <Icon icon={ChevronDown} size="sm" className={cn("mt-0.5 transition-transform", open && "rotate-180")} />
                    </>
                )}
            </button>
            {open && (
                <div
                    ref={menuRef}
                    id={menuId}
                    role="menu"
                    aria-label={label}
                    onKeyDown={onMenuKeyDown}
                    className={cn(
                        "absolute z-30 max-h-popup-max min-w-full w-max overflow-y-auto rounded-8 border border-border bg-surface py-4 text-16 leading-130 tracking-0 text-text shadow-1",
                        align === "end" ? "right-0" : "left-0",
                        dropUp ? "bottom-full mb-1" : "top-full mt-1",
                    )}
                >
                    {items.map((entry, i) =>
                        isItem(entry) ? (
                            <button
                                key={entry.label}
                                type="button"
                                role="menuitem"
                                tabIndex={-1}
                                aria-disabled={entry.disabled || undefined}
                                onClick={() => select(entry)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        select(entry);
                                    }
                                }}
                                className={cn(
                                    "flex min-h-11 w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-surface-muted hover:underline hover:underline-offset-3 focus-visible:bg-focus-ring focus-visible:outline-4 focus-visible:outline-focus focus-visible:-outline-offset-4",
                                    entry.disabled ? "text-text-disabled hover:no-underline" : entry.danger ? "text-error" : "text-text",
                                )}
                            >
                                {entry.icon && <Icon icon={entry.icon} size="md" />}
                                <span className="min-w-0 flex-1">{entry.label}</span>
                            </button>
                        ) : (
                            <div key={`separator-${i}`} role="separator" className="my-2 border-t border-border" />
                        ),
                    )}
                </div>
            )}
        </div>
    );
}
