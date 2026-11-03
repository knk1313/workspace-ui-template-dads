import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { renderApp } from "@/test/renderApp";

describe("NotFoundPage", () => {
    it("存在しない URL ではシェルの中に 404 を表示する", () => {
        renderApp("/no-such-page");
        expect(screen.getByRole("heading", { level: 1, name: "ページが見つかりません" })).toBeInTheDocument();
        expect(screen.getByText("404")).toBeInTheDocument();
        expect(screen.getByRole("main")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "ホームへ戻る" })).toHaveAttribute("href", "/");
        expect(screen.getByRole("link", { name: "申請一覧へ" })).toHaveAttribute("href", "/applications");
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = renderApp("/no-such-page");
        await expectNoA11yViolations(container);
    });
});
