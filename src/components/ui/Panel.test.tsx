import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { Panel } from "./Panel";

describe("Panel", () => {
    it("titleなしはdiv、あり はsection + 見出しで描画する", () => {
        const { rerender } = render(<Panel data-testid="p">補足</Panel>);
        expect(screen.getByTestId("p").tagName).toBe("DIV");
        expect(screen.getByTestId("p")).toHaveClass("bg-surface-muted", "rounded-8");
        rerender(
            <Panel title="絞り込み" titleAs="h2">
                内容
            </Panel>,
        );
        expect(screen.getByRole("region", { name: "絞り込み" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 2, name: "絞り込み" })).toBeInTheDocument();
    });

    it("paddingとclassNameを切り替えられる", () => {
        render(
            <Panel data-testid="p" padding="sm" className="mt-4">
                内容
            </Panel>,
        );
        expect(screen.getByTestId("p")).toHaveClass("p-4", "mt-4");
        expect(screen.getByTestId("p")).not.toHaveClass("md:p-6");
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(
            <Panel title="フィルター">
                <p>内容</p>
            </Panel>,
        );
        await expectNoA11yViolations(container);
    });
});
