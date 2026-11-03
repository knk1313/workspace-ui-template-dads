import { useCallback, useSyncExternalStore } from "react";

// メディアクエリの一致を購読する。レイアウトの切り替え（lg 以上でサイドバー常時表示など）に使う。
//   const isDesktop = useMediaQuery("(min-width: 64rem)");
// matchMedia がない環境（テスト用 DOM など）では false を返す。

/** lg ブレークポイント（64rem = 1024px）。サイドバー / 水平メニューの常時表示に切り替える幅。 */
export const DESKTOP_QUERY = "(min-width: 64rem)";

export function useMediaQuery(query: string): boolean {
    const subscribe = useCallback(
        (onChange: () => void) => {
            if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
            const mql = window.matchMedia(query);
            mql.addEventListener("change", onChange);
            return () => mql.removeEventListener("change", onChange);
        },
        [query],
    );
    const getSnapshot = useCallback(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
        return window.matchMedia(query).matches;
    }, [query]);
    return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
