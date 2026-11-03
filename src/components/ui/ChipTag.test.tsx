import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { ChipTag } from "./ChipTag";

describe("ChipTag", () => {
    it("ラベルを描画する（削除ボタンなし）", () => {
        render(<ChipTag label="東京都" />);
        const chip = screen.getByText("東京都").parentElement!;
        expect(chip).toHaveClass("rounded-full", "border", "border-border", "bg-surface", "min-h-8", "pl-3", "pr-3");
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("onRemoveで削除ボタンが付き、クリックとキーボードで呼ばれる。44pxのタップ領域を持つ", async () => {
        const user = userEvent.setup();
        const onRemove = vi.fn();
        render(<ChipTag label="東京都" onRemove={onRemove} />);
        const button = screen.getByRole("button", { name: "東京都を削除" });
        expect(button).toHaveClass("tap-area", "after:w-target", "focus-visible:focus-ring");
        expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
        await user.tab();
        expect(button).toHaveFocus();
        await user.keyboard("{Enter}");
        expect(onRemove).toHaveBeenCalledTimes(1);
        await user.click(button);
        expect(onRemove).toHaveBeenCalledTimes(2);
    });

    it("hrefでラベルがリンクになる", () => {
        render(
            <MemoryRouter>
                <ChipTag label="証明書" href="/search?category=certificate" onRemove={() => {}} />
            </MemoryRouter>,
        );
        expect(screen.getByRole("link", { name: "証明書" })).toHaveAttribute("href", "/search?category=certificate");
        expect(screen.getByRole("button", { name: "証明書を削除" })).toBeInTheDocument();
    });

    it("leadingでアバターやアイコンを先頭に置ける", () => {
        render(<ChipTag label="山田 太郎" leading={<span data-testid="avatar">山</span>} onRemove={() => {}} />);
        expect(screen.getByTestId("avatar")).toBeInTheDocument();
        expect(screen.getByText("山田 太郎").parentElement).toHaveClass("pl-1");
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(
            <MemoryRouter>
                <div>
                    <ChipTag label="A" />
                    <ChipTag label="B" onRemove={() => {}} />
                    <ChipTag label="C" href="/c" onRemove={() => {}} />
                </div>
            </MemoryRouter>,
        );
        await expectNoA11yViolations(container);
    });
});
