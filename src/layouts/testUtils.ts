import { vi } from "vitest";

// matchMedia を「指定した幅として」モックする（min-width のクエリだけを評価する）。
export function mockViewport(width: number): () => void {
    const original = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => {
        const m = /min-width:\s*([\d.]+)(rem|px)/.exec(query);
        const min = m ? Number(m[1]) * (m[2] === "rem" ? 16 : 1) : 0;
        return {
            matches: width >= min,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        };
    }) as unknown as typeof window.matchMedia;
    return () => {
        window.matchMedia = original;
    };
}
