import { cloneElement, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/cn";

// ポップオーバー（WAI-ARIA APG の Dialog（non-modal）パターン。docs/decisions.md D-11）。
// フィルターの条件や補足設定など、任意の内容をトリガーの近くに開く。モーダルではないので背景は操作できる。
//   - トリガー（ボタン）に aria-expanded / aria-controls を付ける
//   - 開いたら中身の最初のフォーカス可能要素へ（なければパネル自体へ）フォーカス
//   - Esc / 外側クリック / フォーカスが外に出たら閉じ、Esc のときはトリガーへ戻す
//   - role="dialog" + aria-labelledby（title）。見た目は枠 gray-420・角丸 8px・elevation-1

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export type PopoverPlacement = "bottom-start" | "bottom-end";

type TriggerProps = {
    "aria-expanded"?: boolean;
    "aria-controls"?: string;
    "aria-haspopup"?: "dialog";
};

export type PopoverProps = {
    /** 開閉するボタン（Button など 1 つの要素）。aria-expanded / aria-controls / aria-haspopup を付与し、クリックで開閉する。 */
    trigger: ReactElement<TriggerProps>;
    /** パネルの見出し。ダイアログ名になる。 */
    title: ReactNode;
    children: ReactNode;
    placement?: PopoverPlacement;
    /** 外から開閉を制御するとき。 */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    id?: string;
    className?: string;
};

export function Popover({ trigger, title, children, placement = "bottom-start", open: controlledOpen, onOpenChange, id, className }: PopoverProps) {
    const autoId = useId();
    const panelId = id ?? autoId;
    const titleId = `${panelId}-title`;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const open = controlledOpen ?? uncontrolledOpen;
    const rootRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const triggerWrapRef = useRef<HTMLSpanElement>(null);

    // onOpenChange は呼び出し側で毎レンダリング作られることがあるので ref 経由で参照し、setOpen を安定させる。
    const onOpenChangeRef = useRef(onOpenChange);
    useLayoutEffect(() => {
        onOpenChangeRef.current = onOpenChange;
    });
    const setOpen = useCallback((next: boolean) => {
        setUncontrolledOpen(next);
        onOpenChangeRef.current?.(next);
    }, []);

    function focusTrigger() {
        (triggerWrapRef.current?.firstElementChild as HTMLElement | null)?.focus();
    }

    useLayoutEffect(() => {
        if (!open) return;
        const panel = panelRef.current;
        (panel?.querySelector<HTMLElement>(FOCUSABLE) ?? panel)?.focus();
    }, [open]);

    useEffect(() => {
        if (!open) return;
        function onDown(e: MouseEvent) {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [open, setOpen]);

    function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
        if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
            focusTrigger();
        }
    }

    function onBlur(e: FocusEvent<HTMLDivElement>) {
        // フォーカスがポップオーバーの外（トリガーも含まない）へ出たら閉じる。
        if (e.relatedTarget && !rootRef.current?.contains(e.relatedTarget)) setOpen(false);
    }

    // トリガーには ARIA 属性だけを付け、クリックは display: contents のラッパーで受ける
    // （関数を cloneElement に渡すと描画中に ref を読む可能性があると判定されるため）。
    const triggerElement = cloneElement(trigger, {
        "aria-expanded": open,
        "aria-controls": open ? panelId : undefined,
        "aria-haspopup": "dialog",
    });

    return (
        <div ref={rootRef} className={cn("relative inline-block", className)} onBlur={onBlur}>
            <span ref={triggerWrapRef} className="contents" onClick={() => setOpen(!open)}>
                {triggerElement}
            </span>
            {open && (
                <div
                    ref={panelRef}
                    id={panelId}
                    role="dialog"
                    aria-labelledby={titleId}
                    tabIndex={-1}
                    onKeyDown={onKeyDown}
                    className={cn(
                        "absolute top-full z-30 mt-1 w-max max-w-xs rounded-8 border border-border bg-surface p-4 text-16 leading-170 tracking-2 text-text shadow-1 md:max-w-sm",
                        placement === "bottom-end" ? "right-0" : "left-0",
                    )}
                >
                    <h2 id={titleId} className="m-0 mb-2 text-std-17B-170 text-text-strong">
                        {title}
                    </h2>
                    {children}
                </div>
            )}
        </div>
    );
}
