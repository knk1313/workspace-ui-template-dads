import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { Container } from "./Container";

describe("Container", () => {
    it("既定はlg幅（max-w-wide）で左右に画面の余白を持つ", () => {
        render(<Container data-testid="c">本文</Container>);
        expect(screen.getByTestId("c")).toHaveClass("mx-auto", "w-full", "max-w-wide", "px-page-x", "md:px-page-x-wide");
    });

    it("size / flush / asを切り替えられる", () => {
        const { rerender } = render(
            <Container data-testid="c" size="md" flush>
                本文
            </Container>,
        );
        expect(screen.getByTestId("c")).toHaveClass("max-w-content");
        expect(screen.getByTestId("c")).not.toHaveClass("px-page-x");
        rerender(
            <Container data-testid="c" size="full" as="section" aria-label="領域">
                本文
            </Container>,
        );
        expect(screen.getByRole("region", { name: "領域" })).toHaveClass("max-w-none");
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(
            <Container>
                <p>本文</p>
            </Container>,
        );
        await expectNoA11yViolations(container);
    });
});
