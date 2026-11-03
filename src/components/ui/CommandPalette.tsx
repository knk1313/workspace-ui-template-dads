import { Fragment, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Search, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";
import { useFocusTrap } from "./useFocusTrap";

// コマンドパレット（ページやコマンドの検索）。DADS に該当コンポーネントがないため、
// WAI-ARIA APG の Dialog（モーダル）+ Combobox（リストボックス付き）パターンで設計し、見た目は DADS のトークンで統一する（docs/decisions.md D-11）。
//   - role="dialog" aria-modal、暗幕、フォーカストラップ、Esc / 暗幕クリックで閉じる、閉じたら元の要素にフォーカスを戻す。
//   - 入力は role="combobox"（aria-controls / aria-activedescendant / aria-expanded）。プレースホルダーは使わず、ラベルを視覚的に表示する。
//   - 候補は role="listbox" / role="option"。グループは role="group" + aria-labelledby。
//   - ↓ ↑ で候補を移動（端で折り返し）、Home / End で先頭 / 末尾、Enter で実行。該当なしのときはメッセージを表示する。
//   - useCommandPaletteShortcut(onOpen) で Ctrl+K / Cmd+K から開く。

export type CommandItem = {
    id: string;
    label: string;
    /** 見出しでまとめるグループ名（「ページ」「操作」など）。 */
    group?: string;
    icon?: LucideIcon;
    /** ラベル以外の検索語（別名・英語など）。 */
    keywords?: readonly string[];
    onSelect: () => void;
};

export type CommandPaletteProps = {
    open: boolean;
    onClose: () => void;
    items: readonly CommandItem[];
    /** 入力欄のラベル（視覚的に表示する）。 */
    label?: string;
    /** 該当がないときのメッセージ。 */
    emptyMessage?: string;
    className?: string;
};

function matches(item: CommandItem, query: string): boolean {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [item.label, ...(item.keywords ?? [])].some((text) => text.toLowerCase().includes(q));
}

/** Ctrl+K（Windows）/ Cmd+K（Mac）でパレットを開く。 */
export function useCommandPaletteShortcut(onOpen: () => void): void {
    const ref = useRef(onOpen);
    useEffect(() => {
        ref.current = onOpen;
    });
    useEffect(() => {
        function onKeyDown(e: globalThis.KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "k") {
                e.preventDefault();
                ref.current();
            }
        }
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, []);
}

export function CommandPalette({ open, onClose, items, label = "ページやコマンドを検索", emptyMessage = "該当する項目がありません", className }: CommandPaletteProps) {
    const baseId = useId();
    const inputId = `${baseId}-input`;
    const listId = `${baseId}-list`;
    const dialogRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);

    useFocusTrap({ active: open, onEscape: onClose, containerRef: dialogRef, initialFocusRef: inputRef });

    // 閉じたら入力と選択位置を初期化する（次に開いたとき前回の検索語が残らないように）。
    // effect ではなく描画中に前回の open と比べて調整する。
    const [wasOpen, setWasOpen] = useState(open);
    if (wasOpen !== open) {
        setWasOpen(open);
        if (!open) {
            setQuery("");
            setActiveIndex(0);
        }
    }

    const filtered = useMemo(() => items.filter((item) => matches(item, query)), [items, query]);

    // グループごとにまとめる（順序は最初に現れた順）。グループなしの項目は先頭にまとめる。
    const groups = useMemo(() => {
        const map = new Map<string, CommandItem[]>();
        for (const item of filtered) {
            const key = item.group ?? "";
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(item);
        }
        return Array.from(map.entries());
    }, [filtered]);

    const active = filtered[Math.min(activeIndex, filtered.length - 1)];
    const optionId = (item: CommandItem) => `${baseId}-option-${item.id}`;

    function run(item: CommandItem) {
        onClose();
        item.onSelect();
    }

    function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (filtered.length === 0) return;
        const last = filtered.length - 1;
        const index = Math.min(activeIndex, last);
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setActiveIndex(index >= last ? 0 : index + 1);
                break;
            case "ArrowUp":
                e.preventDefault();
                setActiveIndex(index <= 0 ? last : index - 1);
                break;
            case "Home":
                e.preventDefault();
                setActiveIndex(0);
                break;
            case "End":
                e.preventDefault();
                setActiveIndex(last);
                break;
            case "Enter":
                e.preventDefault();
                if (active) run(active);
                break;
            default:
                return;
        }
    }

    // 選択位置が変わったら候補を見える位置へスクロールする。
    useEffect(() => {
        if (!open || !active) return;
        document.getElementById(optionId(active))?.scrollIntoView({ block: "nearest" });
        // optionId は baseId から導出される純粋な関数なので依存に含めない。
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, active]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-scrim p-4 pt-16 md:pt-24">
            {/* 暗幕クリックで閉じる。装飾なのでボタンにはしない（Esc と閉じるボタンがある）。 */}
            <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label="コマンドパレット"
                className={cn(
                    "relative flex max-h-full w-full max-w-160 flex-col overflow-hidden rounded-8 border border-border bg-surface text-text shadow-3",
                    className,
                )}
            >
                <div className="flex flex-col gap-2 border-b border-border p-4">
                    <label htmlFor={inputId} className="text-16 font-bold text-text-strong">
                        {label}
                    </label>
                    <div className="relative">
                        <Icon icon={Search} size="lg" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted" />
                        <input
                            ref={inputRef}
                            id={inputId}
                            type="text"
                            role="combobox"
                            aria-expanded="true"
                            aria-controls={listId}
                            aria-activedescendant={active ? optionId(active) : undefined}
                            aria-autocomplete="list"
                            autoComplete="off"
                            spellCheck={false}
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setActiveIndex(0);
                            }}
                            onKeyDown={onKeyDown}
                            className="h-control-md w-full rounded-8 border border-border-strong bg-surface py-3 pr-4 pl-12 text-16 text-text-strong hover:border-border-emphasis focus-visible:focus-ring"
                        />
                    </div>
                    <p className="m-0 text-14 leading-130 text-text-muted">↑↓ で選択、Enter で実行、Esc で閉じる</p>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto py-2">
                    {filtered.length === 0 ? (
                        <p className="m-0 px-4 py-6 text-center text-text-muted">{emptyMessage}</p>
                    ) : (
                        <div id={listId} role="listbox" aria-label={label}>
                            {groups.map(([group, groupItems], gi) => {
                                const groupId = `${baseId}-group-${gi}`;
                                const options = groupItems.map((item) => {
                                    const selected = item === active;
                                    return (
                                        <div
                                            key={item.id}
                                            id={optionId(item)}
                                            role="option"
                                            aria-selected={selected}
                                            onMouseDown={(e) => e.preventDefault()}
                                            onMouseMove={() => {
                                                const index = filtered.indexOf(item);
                                                if (index !== activeIndex) setActiveIndex(index);
                                            }}
                                            onClick={() => run(item)}
                                            className={cn(
                                                "flex min-h-11 cursor-pointer items-center gap-2 px-4 py-2 text-16",
                                                selected ? "bg-primary-surface font-bold text-primary" : "text-text hover:bg-surface-muted",
                                            )}
                                        >
                                            {item.icon && <Icon icon={item.icon} size="md" />}
                                            <span className="min-w-0 break-words">{item.label}</span>
                                        </div>
                                    );
                                });
                                if (!group) return <Fragment key={groupId}>{options}</Fragment>;
                                return (
                                    <div key={groupId} role="group" aria-labelledby={groupId}>
                                        <div id={groupId} role="presentation" className="px-4 pt-3 pb-1 text-14 leading-130 font-bold text-text-muted">
                                            {group}
                                        </div>
                                        {options}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
