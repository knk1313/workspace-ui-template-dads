import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { renderApp } from "@/test/renderApp";

describe("ServerErrorPage", () => {
    it("/error/500でシステムエラーの画面を表示する", () => {
        renderApp("/error/500");
        expect(screen.getByRole("heading", { level: 1, name: "ページを表示できません" })).toBeInTheDocument();
        expect(screen.getByText("500")).toBeInTheDocument();
        expect(screen.getByText(/時間をおいて/)).toBeInTheDocument();
        expect(screen.getByText(/ヘルプデスク/)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "再読み込み" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "ホームへ戻る" })).toHaveAttribute("href", "/");
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = renderApp("/error/500");
        await expectNoA11yViolations(container);
    });
});
