import { useEffect, useRef, type ReactNode } from "react";
import { useLocation } from "react-router";
import { X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/ui/IconButton";
import { useFocusTrap } from "@/components/ui/useFocusTrap";
import { Brand } from "./ShellHeader";

// モバイル（lg 未満）のメニューを入れるドロワー（DADS ドロワー + モバイルメニュー）。
//   - role="dialog" aria-modal aria-label="メニュー"。左から出る。幅 288px（w-drawer）か全幅（full）。
//   - 暗幕（opacity-gray-100）クリック / 閉じるボタン / Esc で閉じる。フォーカストラップ、閉じた後は元の要素へ復帰。
//   - 経路（URL）が変わったら自動で閉じる。
// 開いている間だけ描画するので、閉じているときは DOM に存在しない。

export type MobileDrawerProps = {
    open: boolean;
    onClose: () => void;
    /** ハンバーガーボタンの aria-controls と対応させる id。 */
    id: string;
    children: ReactNode;
    appName: string;
    logo?: LucideIcon;
    /** full にすると全幅（DADS モバイルメニュー）。 */
    width?: "drawer" | "full";
    /** 画面全体ではなく親要素（relative）の中に収める（デモ埋め込み用）。 */
    contained?: boolean;
    label?: string;
};

export function MobileDrawer({ open, onClose, id, children, appName, logo, width = "drawer", contained = false, label = "メニュー" }: MobileDrawerProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const { pathname } = useLocation();

    useFocusTrap({ active: open, onEscape: onClose, containerRef: panelRef, initialFocusRef: closeRef });

    // 経路が変わったら閉じる（初回描画では閉じない）。
    const lastPath = useRef(pathname);
    useEffect(() => {
        if (lastPath.current !== pathname) {
            lastPath.current = pathname;
            onClose();
        }
    }, [pathname, onClose]);

    if (!open) return null;

    return (
        <div className={cn("inset-0 z-40 flex", contained ? "absolute" : "fixed")}>
            <div className="absolute inset-0 bg-scrim-light" onClick={onClose} aria-hidden="true" />
            <div
                ref={panelRef}
                id={id}
                role="dialog"
                aria-modal="true"
                aria-label={label}
                className={cn(
                    "relative flex h-full flex-col bg-surface text-text shadow-2",
                    width === "full" ? "w-full" : "w-drawer max-w-full border-r border-border",
                )}
            >
                <div className="flex h-header shrink-0 items-center gap-2 border-b border-border px-2">
                    <Brand name={appName} logo={logo} />
                    <IconButton ref={closeRef} icon={X} label="メニューを閉じる" onClick={onClose} className="ml-auto" />
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
            </div>
        </div>
    );
}
