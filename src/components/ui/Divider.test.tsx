import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { Divider } from "./Divider";

describe("Divider", () => {
    it("既定は1pxの実線のhr", () => {
        render(<Divider />);
        const hr = screen.getByRole("separator");
        expect(hr.tagName).toBe("HR");
        expect(hr).toHaveClass("border-t", "border-border");
        expect(hr).not.toHaveClass("border-dashed");
    });

    it("color / weight / styleを切り替えられる", () => {
        const { rerender } = render(<Divider color="strong" weight={2} style="dashed" />);
        expect(screen.getByRole("separator")).toHaveClass("border-t-2", "border-border-on-canvas", "border-dashed");
        rerender(<Divider color="emphasis" weight={4} />);
        expect(screen.getByRole("separator")).toHaveClass("border-t-4", "border-border-emphasis");
    });

    it("verticalはrole=separator + aria-orientationのdiv", () => {
        render(<Divider orientation="vertical" weight={3} />);
        const sep = screen.getByRole("separator");
        expect(sep.tagName).toBe("DIV");
        expect(sep).toHaveAttribute("aria-orientation", "vertical");
        expect(sep).toHaveClass("border-l-3", "self-stretch");
    });

    it("decorativeのときは区切りとして扱わない", () => {
        render(<Divider decorative />);
        expect(screen.queryByRole("separator")).toBeNull();
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(
            <div className="flex">
                <Divider />
                <Divider orientation="vertical" />
                <Divider decorative />
            </div>,
        );
        await expectNoA11yViolations(container);
    });
});
