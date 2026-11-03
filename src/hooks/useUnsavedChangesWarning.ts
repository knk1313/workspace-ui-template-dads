import { useCallback, useEffect, useRef } from "react";
import { useBlocker } from "react-router";
import { useConfirm } from "@/components/ui/ConfirmDialog";

// 入力途中のまま画面を離れようとしたときに確認する。
//   - アプリ内の移動（リンク、戻るボタン）: 確認ダイアログで「破棄して移動」か「入力を続ける」を選ぶ
//   - 再読み込み・タブを閉じる・別のサイトへ移る: ブラウザ標準の確認を出す（文言はブラウザが決める）
// 保存や送信のあとに自分で画面を移るときは、移る前に allowNavigation() を呼ぶ（確認を出さない）。
//   const { allowNavigation } = useUnsavedChangesWarning(isDirty);
//   allowNavigation(); navigate("/applications");
// 同じ画面の中の移動（?tab= の切り替えなど）は対象外にする。

export type UnsavedChangesOptions = {
    title?: string;
    message?: string;
};

export function useUnsavedChangesWarning(when: boolean, { title = "入力内容を破棄して移動しますか", message = "入力した内容は保存されていません。" }: UnsavedChangesOptions = {}) {
    const { confirm } = useConfirm();
    const allowed = useRef(false);
    const whenRef = useRef(when);
    useEffect(() => {
        whenRef.current = when;
        if (!when) allowed.current = false;
    }, [when]);

    const blocker = useBlocker(({ currentLocation, nextLocation }) => whenRef.current && !allowed.current && currentLocation.pathname !== nextLocation.pathname);

    // blocker は描画のたびに別のオブジェクトになりうるため、状態が「止めた」に変わったときだけ確認を出す
    const blockerRef = useRef(blocker);
    useEffect(() => {
        blockerRef.current = blocker;
    });
    useEffect(() => {
        if (blocker.state !== "blocked") return;
        void confirm({ title, message, confirmLabel: "破棄して移動", cancelLabel: "入力を続ける", tone: "error" }).then((ok) => {
            const current = blockerRef.current;
            if (current.state !== "blocked") return;
            if (ok) current.proceed();
            else current.reset();
        });
    }, [blocker.state, confirm, title, message]);

    useEffect(() => {
        if (!when) return;
        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            if (allowed.current) return;
            e.preventDefault();
        };
        window.addEventListener("beforeunload", onBeforeUnload);
        return () => window.removeEventListener("beforeunload", onBeforeUnload);
    }, [when]);

    const allowNavigation = useCallback(() => {
        allowed.current = true;
    }, []);

    return { allowNavigation };
}
