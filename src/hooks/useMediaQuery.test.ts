import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useMediaQuery } from "./useMediaQuery";

const original = window.matchMedia;

afterEach(() => {
    window.matchMedia = original;
});

describe("useMediaQuery", () => {
    it("matchMediaの結果を返し、changeで更新する", () => {
        let matches = false;
        const listeners = new Set<() => void>();
        window.matchMedia = vi.fn().mockImplementation((query: string) => ({
            get matches() {
                return matches;
            },
            media: query,
            addEventListener: (_: string, l: () => void) => listeners.add(l),
            removeEventListener: (_: string, l: () => void) => listeners.delete(l),
        })) as unknown as typeof window.matchMedia;
        const { result, unmount } = renderHook(() => useMediaQuery("(min-width: 64rem)"));
        expect(result.current).toBe(false);
        act(() => {
            matches = true;
            listeners.forEach((l) => l());
        });
        expect(result.current).toBe(true);
        unmount();
        expect(listeners.size).toBe(0);
    });

    it("matchMediaがない環境ではfalse", () => {
        // @ts-expect-error テストのために削除する
        window.matchMedia = undefined;
        const { result } = renderHook(() => useMediaQuery("(min-width: 64rem)"));
        expect(result.current).toBe(false);
    });
});
