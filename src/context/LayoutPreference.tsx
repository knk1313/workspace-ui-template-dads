import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

// アプリケーションシェルの型（サイドバー型 / 上部ナビゲーション型）。設定画面で切り替え、localStorage に保存する。
export type LayoutKind = "sidebar" | "topnav";

export const LAYOUT_STORAGE_KEY = "layout-preference";

type LayoutPreferenceValue = { layout: LayoutKind; setLayout: (layout: LayoutKind) => void };

const LayoutPreferenceContext = createContext<LayoutPreferenceValue | null>(null);

export function useLayoutPreference(): LayoutPreferenceValue {
    const ctx = useContext(LayoutPreferenceContext);
    if (!ctx) throw new Error("useLayoutPreferenceはLayoutPreferenceProviderの内側で使ってください");
    return ctx;
}

function load(): LayoutKind {
    try {
        return localStorage.getItem(LAYOUT_STORAGE_KEY) === "topnav" ? "topnav" : "sidebar";
    } catch {
        return "sidebar";
    }
}

export function LayoutPreferenceProvider({ children }: { children: ReactNode }) {
    const [layout, setState] = useState<LayoutKind>(load);
    const setLayout = useCallback((next: LayoutKind) => {
        setState(next);
        try {
            localStorage.setItem(LAYOUT_STORAGE_KEY, next);
        } catch {
            // 保存できなくても、このタブの間は反映される。
        }
    }, []);
    const value = useMemo(() => ({ layout, setLayout }), [layout, setLayout]);
    return <LayoutPreferenceContext.Provider value={value}>{children}</LayoutPreferenceContext.Provider>;
}
