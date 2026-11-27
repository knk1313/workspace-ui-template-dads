import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { Anchor, Link } from "./Link";

describe("Link", () => {
    it("アプリ内のページへのリンクを、下線付きのリンクの見た目で描く", () => {
        render(
            <MemoryRouter>
                <Link to="/applications">申請一覧</Link>
            </MemoryRouter>,
        );
        const link = screen.getByRole("link", { name: "申請一覧" });
        expect(link).toHaveAttribute("href", "/applications");
        expect(link).toHaveClass("underline", "text-link", "visited:text-link-visited");
    });

    it("visited={false} のときは、訪問済みでも色を変えない", () => {
        render(
            <MemoryRouter>
                <Link to="/applications" visited={false}>
                    申請一覧
                </Link>
            </MemoryRouter>,
        );
        const link = screen.getByRole("link", { name: "申請一覧" });
        expect(link).toHaveClass("underline", "text-link");
        expect(link).not.toHaveClass("visited:text-link-visited");
    });
});

describe("Anchor", () => {
    it("新しいタブで開くときは、rel を付け、そのことを名前に含める", () => {
        render(
            <Anchor href="https://example.jp/" newTab>
                デジタル庁デザインシステム
            </Anchor>,
        );
        const link = screen.getByRole("link", { name: "デジタル庁デザインシステム新しいタブで開きます" });
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("同じタブで開くときは target を付けない", () => {
        render(<Anchor href="/files/manual.pdf">操作の手引き</Anchor>);
        expect(screen.getByRole("link", { name: "操作の手引き" })).not.toHaveAttribute("target");
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(
            <MemoryRouter>
                <Link to="/">ホーム</Link>
                <Anchor href="https://example.jp/" newTab>
                    外部のサイト
                </Anchor>
            </MemoryRouter>,
        );
        await expectNoA11yViolations(container);
    });
});
