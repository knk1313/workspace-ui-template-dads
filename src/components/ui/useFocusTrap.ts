import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

// モーダルな UI（モバイルメニューのドロワー、コマンドパレット）の共通の振る舞い。
// 開いた直後にフォーカスを移す、Tab / Shift+Tab を範囲内で巡回させる、Esc で閉じる、閉じたら元の要素にフォーカスを戻す。
// src/hooks/useModalBehavior.ts は別の担当者が改修中のため、ここでは依存せずに最小限を実装する。

const FOCUSABLE = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
].join(", ");

export type FocusTrapOptions = {
    /** 開いているか。false の間は何もしない。 */
    active: boolean;
    /** Esc が押されたとき。 */
    onEscape?: () => void;
    /** フォーカスを閉じ込める範囲。 */
    containerRef: RefObject<HTMLElement | null>;
    /** 開いた直後にフォーカスする要素。省略時は範囲内の最初の操作要素。 */
    initialFocusRef?: RefObject<HTMLElement | null>;
};

export function useFocusTrap({ active, onEscape, containerRef, initialFocusRef }: FocusTrapOptions): void {
    // onEscape は呼び出し側で毎レンダリング作られることが多い。effect の依存に入れると
    // 再実行のたびにフォーカスが初期位置に戻ってしまうので ref で参照する。
    const onEscapeRef = useRef(onEscape);
    useLayoutEffect(() => {
        onEscapeRef.current = onEscape;
    });

    useEffect(() => {
        if (!active) return;
        const container = containerRef.current;
        if (!container) return;
        const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;

        const focusables = () => Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.checkVisibility?.() ?? true);

        (initialFocusRef?.current ?? focusables()[0] ?? container).focus();

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                e.preventDefault();
                onEscapeRef.current?.();
                return;
            }
            if (e.key !== "Tab") return;
            const items = focusables();
            if (items.length === 0) {
                e.preventDefault();
                return;
            }
            const first = items[0];
            const last = items[items.length - 1];
            const active = document.activeElement;
            const outside = !container!.contains(active);
            if (e.shiftKey && (active === first || outside)) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && (active === last || outside)) {
                e.preventDefault();
                first.focus();
            }
        }

        document.addEventListener("keydown", onKeyDown);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = prevOverflow;
            if (previouslyFocused?.isConnected) previouslyFocused.focus();
        };
    }, [active, containerRef, initialFocusRef]);
}
