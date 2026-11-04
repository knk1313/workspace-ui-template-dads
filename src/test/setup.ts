import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { resetStores } from "@/api/db";
import { clearQueryCache } from "@/api/query";

afterEach(() => {
    cleanup();
    localStorage.clear();
    sessionStorage.clear();
    delete document.documentElement.dataset.theme;
    // ダミー API のデータと読み込み結果をテストごとに初期値へ戻す
    resetStores();
    clearQueryCache();
});

// jsdom にない API のスタブ。
// ResizeObserver: Recharts の ResponsiveContainer が使う。
if (typeof globalThis.ResizeObserver === "undefined") {
    globalThis.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
    } as unknown as typeof ResizeObserver;
}

// matchMedia: レイアウトの判定で使う。既定は「デスクトップ幅」として扱う。
if (typeof window.matchMedia === "undefined") {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));
}

// <dialog>: jsdom は showModal / close を実装していない。
if (typeof HTMLDialogElement !== "undefined" && !HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
        this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.show = function () {
        this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function () {
        this.removeAttribute("open");
        this.dispatchEvent(new Event("close"));
    };
}

// scrollIntoView: リストボックスのキーボード操作で使う。
if (typeof Element.prototype.scrollIntoView === "undefined") {
    Element.prototype.scrollIntoView = () => {};
}
