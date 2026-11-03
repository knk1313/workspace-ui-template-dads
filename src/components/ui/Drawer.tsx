import { useId, useRef, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useModalBehavior } from "@/hooks/useModalBehavior";
import { Icon } from "./Icon";

// DADS ドロワー（HTML 版 drawer.css）。画面の左右端から展開するモーダルなコンテナ。
// モバイルメニューや、一覧を見ながらの編集パネルなどを格納する。
//   - 幅 288px（lg は md 以上で 512px）、全高、elevation-2、暗幕 opacity-gray-100
//   - ヘッダー（任意のタイトル + 閉じるボタン。left は左寄せ、right は右寄せ）、スクロールする本文、固定のフッター
//   - フォーカストラップ、Esc で閉じる、閉じたら開く前の要素へ戻す、背景は inert
// document.body にポータルで描画する。

export type DrawerPlacement = "left" | "right";
export type DrawerSize = "md" | "lg";

export type DrawerProps = {
    open: boolean;
    onClose: () => void;
    /** ヘッダーに表示する見出し（h2）。省略時は aria-label を渡す。 */
    title?: ReactNode;
    /** title がないときのダイアログ名。 */
    "aria-label"?: string;
    children: ReactNode;
    /** 本文の下に固定表示する帯（確定ボタンなど）。 */
    footer?: ReactNode;
    placement?: DrawerPlacement;
    size?: DrawerSize;
    closeLabel?: string;
    /** 暗幕のクリックで閉じるか。既定は true（モバイルメニューの慣習）。入力フォームを入れるときは false にする。 */
    dismissOnBackdrop?: boolean;
    id?: string;
    className?: string;
};

export function Drawer({
    open,
    onClose,
    title,
    "aria-label": ariaLabel,
    children,
    footer,
    placement = "right",
    size = "md",
    closeLabel = "閉じる",
    dismissOnBackdrop = true,
    id,
    className,
}: DrawerProps) {
    const autoId = useId();
    const drawerId = id ?? autoId;
    const titleId = `${drawerId}-title`;
    const overlayRef = useRef<HTMLDivElement>(null);

    useModalBehavior({ open, onClose, containerRef: overlayRef, inertOutside: true });

    if (!open) return null;

    function onBackdropMouseDown(e: MouseEvent<HTMLDivElement>) {
        if (dismissOnBackdrop && e.target === e.currentTarget) onClose();
    }

    return createPortal(
        <div ref={overlayRef} className={cn("fixed inset-0 z-50 flex bg-scrim-light", placement === "right" ? "justify-end" : "justify-start")} onMouseDown={onBackdropMouseDown}>
            <div
                id={drawerId}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                aria-label={title ? undefined : ariaLabel}
                data-placement={placement}
                className={cn(
                    "flex h-full w-drawer max-w-full flex-col bg-surface text-16 leading-170 tracking-2 text-text shadow-2",
                    size === "lg" && "md:w-lg",
                    className,
                )}
            >
                {/* DADS: 閉じるボタンは left のとき左端、right のとき右端。タイトルは閉じるボタンの反対側に置く。 */}
                <div className={cn("flex shrink-0 items-center gap-4 px-4 py-5", placement === "left" ? "flex-row-reverse justify-end" : "justify-between")}>
                    {title ? (
                        <h2 id={titleId} className="m-0 min-w-0 flex-1 text-std-20B-150 text-text-strong">
                            {title}
                        </h2>
                    ) : (
                        <span className="flex-1" />
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="tap-area flex shrink-0 items-center gap-1 rounded-6 px-3 pt-1 pb-1.5 text-16 leading-none tracking-2 text-text hover:bg-surface-muted hover:underline hover:underline-offset-3 focus-visible:focus-ring-fill"
                    >
                        <Icon icon={X} size="lg" className="mt-0.5 text-text-strong" />
                        {closeLabel}
                    </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">{children}</div>
                {footer && <div className="shrink-0 border-t border-border px-4 py-3">{footer}</div>}
            </div>
        </div>,
        document.body,
    );
}
