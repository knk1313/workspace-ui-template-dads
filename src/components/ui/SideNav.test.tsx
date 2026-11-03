import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { FileText, LayoutDashboard, Settings } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { SideNav, type SideNavSection } from "./SideNav";

const sections: SideNavSection[] = [
    { title: "ナビゲーション", items: [{ label: "ダッシュボード", href: "/", icon: LayoutDashboard }] },
    {
        title: "ワークスペース",
        items: [
            {
                label: "申請",
                href: "/items",
                icon: FileText,
                children: [
                    { label: "一覧", href: "/items", end: true },
                    { label: "新規作成", href: "/items/new" },
                ],
            },
            { label: "設定", href: "/settings", icon: Settings },
        ],
    },
];

function renderNav(path: string, props: Partial<React.ComponentProps<typeof SideNav>> = {}) {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <SideNav sections={sections} {...props} />
        </MemoryRouter>,
    );
}

describe("SideNav", () => {
    it("nav + セクション見出し + リンクを描画し、現在地に aria-current=page を付ける", () => {
        renderNav("/settings");
        expect(screen.getByRole("navigation", { name: "メインナビゲーション" })).toBeInTheDocument();
        expect(screen.getByText("ワークスペース")).toHaveClass("text-14", "font-bold", "text-text-muted");
        const current = screen.getByRole("link", { name: "設定" });
        expect(current).toHaveAttribute("aria-current", "page");
        expect(current).toHaveClass("bg-primary-surface", "text-primary", "font-bold", "before:bg-primary");
        expect(screen.getByRole("link", { name: "ダッシュボード" })).not.toHaveAttribute("aria-current");
    });

    it("ルート（/）は完全一致のときだけ現在地になる", () => {
        renderNav("/settings");
        expect(screen.getByRole("link", { name: "ダッシュボード" })).not.toHaveAttribute("aria-current");
    });

    it("子項目は開閉ボタンで開閉し、現在地を含むときは初期展開される", async () => {
        const user = userEvent.setup();
        renderNav("/items/new");
        const toggle = screen.getByRole("button", { name: "申請" });
        expect(toggle).toHaveAttribute("aria-expanded", "true");
        const sub = document.getElementById(toggle.getAttribute("aria-controls")!)!;
        expect(sub).not.toHaveAttribute("hidden");
        expect(screen.getByRole("link", { name: "新規作成" })).toHaveAttribute("aria-current", "page");
        // 親は開閉ボタンで、現在地（aria-current）は子項目にだけ付く
        expect(screen.getAllByRole("link", { current: "page" })).toHaveLength(1);
        await user.click(toggle);
        expect(toggle).toHaveAttribute("aria-expanded", "false");
        expect(sub).toHaveAttribute("hidden");
    });

    it("現在地を含まない子項目は閉じている", () => {
        renderNav("/settings");
        expect(screen.getByRole("button", { name: "申請" })).toHaveAttribute("aria-expanded", "false");
    });

    it("Tab と Enter でキーボード操作できる", async () => {
        const user = userEvent.setup();
        renderNav("/");
        await user.tab();
        expect(screen.getByRole("link", { name: "ダッシュボード" })).toHaveFocus();
        await user.tab();
        const toggle = screen.getByRole("button", { name: "申請" });
        expect(toggle).toHaveFocus();
        await user.keyboard("{Enter}");
        expect(toggle).toHaveAttribute("aria-expanded", "true");
        await user.tab();
        expect(screen.getByRole("link", { name: "一覧" })).toHaveFocus();
        await user.keyboard(" ");
        expect(toggle).toHaveAttribute("aria-expanded", "true");
    });

    it("collapsed ではラベルを sr-only にし、title を付け、開閉ボタンを出さない", () => {
        renderNav("/", { collapsed: true });
        const link = screen.getByRole("link", { name: "ダッシュボード" });
        expect(link).toHaveAttribute("title", "ダッシュボード");
        expect(link.querySelector("span")).toHaveClass("sr-only");
        expect(screen.queryByRole("button")).toBeNull();
        expect(screen.getByRole("link", { name: "申請" })).toHaveAttribute("href", "/items");
        expect(screen.getByText("ナビゲーション")).toHaveClass("sr-only");
    });

    it("onNavigate は項目を選んだときに呼ばれる", async () => {
        const user = userEvent.setup();
        const onNavigate = vi.fn();
        renderNav("/", { onNavigate });
        await user.click(screen.getByRole("link", { name: "設定" }));
        expect(onNavigate).toHaveBeenCalledTimes(1);
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = renderNav("/items");
        await expectNoA11yViolations(container);
    });
});
