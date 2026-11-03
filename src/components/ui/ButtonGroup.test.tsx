import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { Button } from "./Button";
import { ButtonGroup } from "./ButtonGroup";

describe("ButtonGroup", () => {
    it("既定は右寄せで、モバイルでは確定が上に来るよう反転して縦に積む", () => {
        render(
            <ButtonGroup data-testid="group">
                <Button variant="text">キャンセル</Button>
                <Button>保存</Button>
            </ButtonGroup>,
        );
        const group = screen.getByTestId("group");
        expect(group).toHaveClass("flex-col-reverse", "md:flex-row", "justify-end", "md:gap-4", "gap-2");
        expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["キャンセル", "保存"]);
    });

    it("align / direction / stackOnMobile を切り替えられる", () => {
        const { rerender } = render(
            <ButtonGroup data-testid="group" align="start" stackOnMobile={false}>
                <Button>A</Button>
            </ButtonGroup>,
        );
        expect(screen.getByTestId("group")).toHaveClass("flex-row", "justify-start", "gap-4");
        expect(screen.getByTestId("group")).not.toHaveClass("flex-col");
        rerender(
            <ButtonGroup data-testid="group" direction="column" align="center">
                <Button>A</Button>
            </ButtonGroup>,
        );
        expect(screen.getByTestId("group")).toHaveClass("flex-col", "items-center", "gap-2");
    });

    it("className で拡張できる", () => {
        render(
            <ButtonGroup data-testid="group" className="mt-6">
                <Button>A</Button>
            </ButtonGroup>,
        );
        expect(screen.getByTestId("group")).toHaveClass("mt-6");
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(
            <ButtonGroup>
                <Button variant="text">キャンセル</Button>
                <Button variant="outline">下書き保存</Button>
                <Button>送信</Button>
            </ButtonGroup>,
        );
        await expectNoA11yViolations(container);
    });
});
