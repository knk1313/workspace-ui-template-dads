import { createPortal } from "react-dom";
import { usePageAnnouncement } from "@/hooks/usePageTitle";

// 画面を移ったことを読み上げる領域。アプリに一つだけ置く（src/App.tsx）。
// 移る前の画面でモーダルが開いていても読み上げられるよう、body の直下に置いて inert の対象から外す。
export function PageAnnouncer() {
    const text = usePageAnnouncement();
    return createPortal(
        <div aria-live="polite" data-modal-exempt="" className="sr-only">
            {text}
        </div>,
        document.body,
    );
}
