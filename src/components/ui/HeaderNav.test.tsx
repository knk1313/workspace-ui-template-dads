import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { HeaderNav } from "./HeaderNav";

const items = [
    { label: "ホーム", href: "/" },
    { label: "申請", href: "/items" },
    { label: "設定", href: "/settings" },
];

function renderNav(path: string) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <HeaderNav items={items} />
        </MemoryRouter>,
    );
}

describe("HeaderNav", () => {
    it("nav + ul でリンクを並べる", () => {
        renderNav("/");
        const nav = screen.getByRole("navigation", { name: "メインナビゲーション" });
        expect(nav.querySelector("ul")).toBeInTheDocument();
        expect(screen.getAllByRole("link")).toHaveLength(3);
    });

    it("現在地に aria-current=page と下線 4px を付ける（下位パスも含む）", () => {
        renderNav("/items/123");
        const current = screen.getByRole("link", { name: "申請" });
        expect(current).toHaveAttribute("aria-current", "page");
        expect(current).toHaveClass("after:h-1", "after:bg-primary");
        // "/" は完全一致のみ
        expect(screen.getByRole("link", { name: "ホーム" })).not.toHaveAttribute("aria-current");
        expect(screen.getByRole("link", { name: "設定" })).toHaveClass("hover:bg-surface-muted");
    });

    it("Tab で順に移動できる", async () => {
        const user = userEvent.setup();
        renderNav("/");
        await user.tab();
        expect(screen.getByRole("link", { name: "ホーム" })).toHaveFocus();
        await user.tab();
        expect(screen.getByRole("link", { name: "申請" })).toHaveFocus();
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = renderNav("/settings");
        await expectNoA11yViolations(container);
    });
});
