import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router";

/**
 * 画面を移ったら、本文（main）へフォーカスを移す。押したリンクにフォーカスが残ると、キーボードやスクリーンリーダーの利用者が、
 * 毎回ナビゲーションの途中から本文までたどることになるため（docs/decisions.md D-34）。
 * - 最初に開いたときと再読み込みでは動かさない（「本文へスキップ」から始められるように）
 * - 同じ画面の中の移動（?tab= など）では動かさない
 * - トーストの「元に戻す」やダイアログにフォーカスがあるときは、奪わない
 *
 * ready は、本文を描いたら true にする（ログインの確認が済むまでは本文がない）。
 */
export function useFocusOnNavigate(ready: boolean): void {
    const { pathname } = useLocation();
    const navigationType = useNavigationType();
    const previous = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (!ready || previous.current === pathname) return;
        const first = previous.current === undefined;
        previous.current = pathname;
        // この部品の最初の描画でも、ログイン画面から移ってきたときは動かす
        if (first && navigationType === "POP") return;
        if (document.activeElement?.closest("[data-modal-exempt], [role='dialog']")) return;
        document.getElementById("main")?.focus({ preventScroll: true });
    }, [ready, pathname, navigationType]);
}
