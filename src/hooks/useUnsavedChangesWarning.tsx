import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { useBlocker } from "react-router";
import { useConfirm } from "@/components/ui/ConfirmDialog";

// 入力途中のまま画面を離れようとしたときに確認する。
//   - アプリ内の移動（リンク、戻るボタン）: 確認ダイアログで「破棄して移動」か「入力を続ける」を選ぶ
//   - 再読み込み・タブを閉じる・別のサイトへ移る: ブラウザー標準の確認を出す（文言はブラウザーが決める）
// 保存や送信のあとに自分で画面を移るときは、移る前に allowNavigation() を呼ぶ（確認を出さない）。
//   const { allowNavigation } = useUnsavedChangesWarning(isDirty);
//   allowNavigation(); navigate("/applications");
// 同じ画面の中の移動（?tab= の切り替えなど）は対象外にする。
//
// react-router の useBlocker はルーターに一つしか置けない（二つ目以降は無視される）。
// そのため、ブロッカーは UnsavedChangesProvider に一つだけ置き、各フォームは「変更がある」ことを登録するだけにする。

export type UnsavedChangesOptions = {
    title?: string;
    message?: string;
};

type Guard = Required<UnsavedChangesOptions>;

type ContextValue = {
    register: (id: string, guard: Guard) => void;
    unregister: (id: string) => void;
    allow: () => void;
};

const UnsavedChangesContext = createContext<ContextValue | null>(null);

const DEFAULT_GUARD: Guard = {
    title: "入力内容を破棄して移動する",
    message: "移動すると、入力した内容は消えます。消えた内容は元に戻せません。",
};

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
    const { confirm } = useConfirm();
    // 登録の順に並べ、確認には最後に登録したフォームの文言を使う
    const guards = useRef(new Map<string, Guard>());
    const [count, setCount] = useState(0);
    const allowed = useRef(false);

    const register = useCallback((id: string, guard: Guard) => {
        guards.current.delete(id);
        guards.current.set(id, guard);
        setCount(guards.current.size);
    }, []);
    const unregister = useCallback((id: string) => {
        guards.current.delete(id);
        setCount(guards.current.size);
    }, []);
    const allow = useCallback(() => {
        allowed.current = true;
    }, []);

    const blocker = useBlocker(({ currentLocation, nextLocation }) => {
        if (currentLocation.pathname === nextLocation.pathname) return false;
        if (allowed.current) {
            allowed.current = false;
            return false;
        }
        return guards.current.size > 0;
    });

    // blocker は描画のたびに別のオブジェクトになりうるため、状態が「止めた」に変わったときだけ確認を出す
    const blockerRef = useRef(blocker);
    useEffect(() => {
        blockerRef.current = blocker;
    });
    useEffect(() => {
        if (blocker.state !== "blocked") return;
        const guard = [...guards.current.values()].at(-1) ?? DEFAULT_GUARD;
        void confirm({ ...guard, confirmLabel: "破棄して移動", cancelLabel: "入力を続ける", tone: "error" }).then((ok) => {
            const current = blockerRef.current;
            if (current.state !== "blocked") return;
            if (ok) current.proceed();
            else current.reset();
        });
    }, [blocker.state, confirm]);

    useEffect(() => {
        if (count === 0) return;
        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            if (allowed.current) return;
            e.preventDefault();
        };
        window.addEventListener("beforeunload", onBeforeUnload);
        return () => window.removeEventListener("beforeunload", onBeforeUnload);
    }, [count]);

    const value = useMemo(() => ({ register, unregister, allow }), [register, unregister, allow]);
    return <UnsavedChangesContext.Provider value={value}>{children}</UnsavedChangesContext.Provider>;
}

/** 保存していない変更があることを登録する。when が true の間、画面を離れるときに確認を出す。 */
export function useUnsavedChangesWarning(when: boolean, { title = DEFAULT_GUARD.title, message = DEFAULT_GUARD.message }: UnsavedChangesOptions = {}) {
    const ctx = useContext(UnsavedChangesContext);
    if (!ctx) throw new Error("useUnsavedChangesWarningはUnsavedChangesProviderの内側で使ってください");
    const { register, unregister, allow } = ctx;
    const id = useId();

    useEffect(() => {
        if (!when) return;
        register(id, { title, message });
        return () => unregister(id);
    }, [when, id, title, message, register, unregister]);

    return { allowNavigation: allow };
}
