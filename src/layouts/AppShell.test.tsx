import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { FileText, LayoutDashboard, Settings } from "lucide-react";
import { afterEach, describe, expect, it } from "vitest";
import type { NavSection } from "@/app.config";
import { expectNoA11yViolations } from "@/test/axe";
import { AppShell } from "./AppShell";
import { mockViewport } from "./testUtils";

const navigation: NavSection[] = [
    { title: "ナビゲーション", items: [{ label: "ダッシュボード", href: "/", icon: LayoutDashboard }] },
    {
        title: "ワークスペース",
        items: [
            { label: "ドキュメント", href: "/documents", icon: FileText },
            { label: "設定", href: "/settings", icon: Settings },
        ],
    },
];

let restore: (() => void) | undefined;
afterEach(() => restore?.());

function renderShell(path = "/") {
    const user = userEvent.setup();
    const result = render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route element={<AppShell navigation={navigation} appName="テストアプリ" headerActions={<button type="button">通知</button>} />}>
                    <Route path="/" element={<h1>ダッシュボード画面</h1>} />
                    <Route path="/documents" element={<h1>ドキュメント画面</h1>} />
                    <Route path="/settings" element={<h1>設定画面</h1>} />
                </Route>
            </Routes>
        </MemoryRouter>,
    );
    return { user, ...result };
}

describe("AppShell（デスクトップ）", () => {
    it("ヘッダー・サイドバー・main を描画し、<Outlet /> の内容を出す", () => {
        restore = mockViewport(1280);
        renderShell("/documents");
        expect(screen.getByRole("banner")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "テストアプリ" })).toHaveAttribute("href", "/");
        expect(screen.getByRole("button", { name: "通知" })).toBeInTheDocument();
        expect(screen.getByRole("main")).toHaveAttribute("id", "main");
        expect(screen.getByRole("heading", { name: "ドキュメント画面" })).toBeInTheDocument();
        expect(screen.getByRole("navigation", { name: "メインナビゲーション" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "ドキュメント" })).toHaveAttribute("aria-current", "page");
        // デスクトップではハンバーガーを出さない
        expect(screen.queryByRole("button", { name: "メニュー" })).toBeNull();
    });

    it("最初の Tab で「本文へスキップ」が現れ、#main を指す", async () => {
        restore = mockViewport(1280);
        const { user } = renderShell();
        await user.tab();
        const skip = screen.getByRole("link", { name: "本文へスキップ" });
        expect(skip).toHaveFocus();
        expect(skip).toHaveAttribute("href", "#main");
        expect(skip).toHaveClass("sr-only", "focus:not-sr-only");
    });

    it("サイドバーを折りたたむと、アイコンだけになり title が付く", async () => {
        restore = mockViewport(1280);
        const { user } = renderShell();
        const toggle = screen.getByRole("button", { name: "サイドバーを折りたたむ" });
        expect(toggle).toHaveAttribute("aria-expanded", "true");
        expect(toggle.closest("aside")?.parentElement).toHaveClass("w-sidebar");
        await user.click(toggle);
        const expand = screen.getByRole("button", { name: "サイドバーを広げる" });
        expect(expand).toHaveAttribute("aria-expanded", "false");
        expect(expand.closest("aside")?.parentElement).toHaveClass("w-sidebar-collapsed");
        expect(screen.getByRole("link", { name: "設定" })).toHaveAttribute("title", "設定");
    });

    it("アクセシビリティ違反がない", async () => {
        restore = mockViewport(1280);
        const { container } = renderShell();
        await expectNoA11yViolations(container);
    });
});

describe("AppShell（モバイル）", () => {
    it("サイドバーを出さず、ハンバーガーでドロワーを開閉する", async () => {
        restore = mockViewport(375);
        const { user } = renderShell();
        expect(screen.queryByRole("complementary")).toBeNull();
        expect(screen.queryByRole("navigation")).toBeNull();
        const hamburger = screen.getByRole("button", { name: "メニュー" });
        expect(hamburger).toHaveAttribute("aria-expanded", "false");
        await user.click(hamburger);
        const dialog = screen.getByRole("dialog", { name: "メニュー" });
        expect(dialog).toHaveAttribute("aria-modal", "true");
        expect(hamburger).toHaveAttribute("aria-expanded", "true");
        expect(hamburger).toHaveAttribute("aria-controls", dialog.id);
        // 開いた直後は閉じるボタンにフォーカス
        const close = screen.getByRole("button", { name: "メニューを閉じる" });
        expect(close).toHaveFocus();
        await user.click(close);
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(hamburger).toHaveFocus();
    });

    it("Esc で閉じ、Tab はドロワー内を巡回する", async () => {
        restore = mockViewport(375);
        const { user } = renderShell();
        await user.click(screen.getByRole("button", { name: "メニュー" }));
        const dialog = screen.getByRole("dialog");
        await user.tab({ shift: true });
        expect(dialog.contains(document.activeElement)).toBe(true);
        for (let i = 0; i < 6; i++) {
            await user.tab();
            expect(dialog.contains(document.activeElement)).toBe(true);
        }
        await user.keyboard("{Escape}");
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("項目を選んで経路が変わるとドロワーが閉じる", async () => {
        restore = mockViewport(375);
        const { user } = renderShell();
        await user.click(screen.getByRole("button", { name: "メニュー" }));
        await user.click(screen.getByRole("link", { name: "設定" }));
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(screen.getByRole("heading", { name: "設定画面" })).toBeInTheDocument();
    });

    it("ドロワーを開いた状態でアクセシビリティ違反がない", async () => {
        restore = mockViewport(375);
        const { user, container } = renderShell();
        await user.click(screen.getByRole("button", { name: "メニュー" }));
        await expectNoA11yViolations(container);
    });
});

describe("AppShell（children / embedded）", () => {
    it("children を渡すとそれを描画し、embedded では main とスキップリンクを出さない", () => {
        restore = mockViewport(1280);
        render(
            <MemoryRouter>
                <AppShell navigation={navigation} embedded>
                    <p>埋め込み本文</p>
                </AppShell>
            </MemoryRouter>,
        );
        expect(screen.getByText("埋め込み本文")).toBeInTheDocument();
        expect(screen.queryByRole("main")).toBeNull();
        expect(screen.queryByRole("link", { name: "本文へスキップ" })).toBeNull();
    });
});
