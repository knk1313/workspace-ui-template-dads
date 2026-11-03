import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { FileText, LayoutDashboard } from "lucide-react";
import { afterEach, describe, expect, it } from "vitest";
import type { NavSection } from "@/app.config";
import { expectNoA11yViolations } from "@/test/axe";
import { TopNavLayout } from "./TopNavLayout";
import { mockViewport } from "./testUtils";

const navigation: NavSection[] = [
    { title: "メイン", items: [{ label: "ダッシュボード", href: "/", icon: LayoutDashboard }] },
    { title: "ワークスペース", items: [{ label: "ドキュメント", href: "/documents", icon: FileText }] },
];

let restore: (() => void) | undefined;
afterEach(() => restore?.());

function renderLayout(path = "/") {
    const user = userEvent.setup();
    const result = render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route element={<TopNavLayout navigation={navigation} appName="テストアプリ" />}>
                    <Route path="/" element={<h1>ホーム画面</h1>} />
                    <Route path="/documents" element={<h1>ドキュメント画面</h1>} />
                </Route>
            </Routes>
        </MemoryRouter>,
    );
    return { user, ...result };
}

describe("TopNavLayout", () => {
    it("デスクトップではヘッダーに水平メニューを出し、現在地に aria-current を付ける", () => {
        restore = mockViewport(1280);
        renderLayout("/documents");
        const nav = screen.getByRole("navigation", { name: "メインナビゲーション" });
        expect(screen.getByRole("banner").contains(nav)).toBe(true);
        expect(screen.getByRole("link", { name: "ドキュメント" })).toHaveAttribute("aria-current", "page");
        expect(screen.getByRole("main")).toHaveTextContent("ドキュメント画面");
        expect(screen.queryByRole("button", { name: "メニュー" })).toBeNull();
    });

    it("スキップリンクが最初のフォーカス対象になる", async () => {
        restore = mockViewport(1280);
        const { user } = renderLayout();
        await user.tab();
        expect(screen.getByRole("link", { name: "本文へスキップ" })).toHaveFocus();
    });

    it("モバイルではハンバーガーで全幅のモバイルメニューを開閉する", async () => {
        restore = mockViewport(375);
        const { user } = renderLayout();
        expect(screen.queryByRole("navigation")).toBeNull();
        await user.click(screen.getByRole("button", { name: "メニュー" }));
        const dialog = screen.getByRole("dialog", { name: "メニュー" });
        expect(dialog).toHaveClass("w-full");
        expect(screen.getByText("ワークスペース")).toBeInTheDocument();
        await user.keyboard("{Escape}");
        expect(screen.queryByRole("dialog")).toBeNull();
        await user.click(screen.getByRole("button", { name: "メニュー" }));
        await user.click(screen.getByRole("link", { name: "ドキュメント" }));
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(screen.getByRole("heading", { name: "ドキュメント画面" })).toBeInTheDocument();
    });

    it("アクセシビリティ違反がない", async () => {
        restore = mockViewport(1280);
        const { container } = renderLayout();
        await expectNoA11yViolations(container);
    });
});
