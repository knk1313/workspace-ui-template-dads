import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

// 配色（ライト / ダーク / OS の設定に合わせる）。設定画面で切り替え、localStorage に保存する。
// 実際の配色は <html data-theme="light|dark"> で切り替える（src/tokens/theme-dark.css）。
// 画面が一瞬白く光らないよう、最初の data-theme は index.html の先頭のスクリプトが付ける。判定はそちらと合わせる（キーはビルドで埋め込む）。
export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

import { readStored, writeStored } from "@/lib/storage";
import { THEME_STORAGE_KEY } from "./themeStorageKey";

export { THEME_STORAGE_KEY };
const DARK_QUERY = "(prefers-color-scheme: dark)";

type ThemePreferenceValue = {
    preference: ThemePreference;
    setPreference: (next: ThemePreference) => void;
    /** 実際に使っている配色。 */
    theme: ResolvedTheme;
};

const ThemePreferenceContext = createContext<ThemePreferenceValue | null>(null);

export function useThemePreference(): ThemePreferenceValue {
    const ctx = useContext(ThemePreferenceContext);
    if (!ctx) throw new Error("useThemePreferenceはThemePreferenceProviderの内側で使ってください");
    return ctx;
}

function load(): ThemePreference {
    return readStored<ThemePreference>(THEME_STORAGE_KEY, (v) => (v === "light" || v === "dark" ? v : undefined), "system");
}

function systemTheme(): ResolvedTheme {
    return typeof window.matchMedia === "function" && window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
    const [preference, setState] = useState<ThemePreference>(load);
    const [system, setSystem] = useState<ResolvedTheme>(systemTheme);

    // OS の設定が変わったら追従する（「OSの設定に合わせる」のとき）。
    useEffect(() => {
        if (typeof window.matchMedia !== "function") return;
        const mql = window.matchMedia(DARK_QUERY);
        const onChange = () => setSystem(mql.matches ? "dark" : "light");
        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
    }, []);

    const theme: ResolvedTheme = preference === "system" ? system : preference;
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    const setPreference = useCallback((next: ThemePreference) => {
        setState(next);
        writeStored(THEME_STORAGE_KEY, next === "system" ? null : next);
    }, []);

    const value = useMemo(() => ({ preference, setPreference, theme }), [preference, setPreference, theme]);
    return <ThemePreferenceContext.Provider value={value}>{children}</ThemePreferenceContext.Provider>;
}
