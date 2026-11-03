import { render, screen } from "@testing-library/react";
import { Settings } from "lucide-react";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { Heading } from "./Heading";

describe("Heading", () => {
    it("levelに応じた見出し要素と既定サイズで描画する", () => {
        const { rerender } = render(<Heading level={1}>ページ</Heading>);
        expect(screen.getByRole("heading", { level: 1, name: "ページ" })).toHaveClass("text-std-32B-150");
        rerender(<Heading level={3}>節</Heading>);
        expect(screen.getByRole("heading", { level: 3 })).toHaveClass("text-std-20B-150");
    });

    it("sizeはレベルと独立に指定できる", () => {
        render(
            <Heading level={2} size={36}>
                大見出し
            </Heading>,
        );
        expect(screen.getByRole("heading", { level: 2 })).toHaveClass("text-std-36B-140");
    });

    it("shoulder / subtitleはhgroupのpになり、見出し要素にならない", () => {
        render(
            <Heading level={2} shoulder="第1章" subtitle="概要">
                見出し
            </Heading>,
        );
        const heading = screen.getByRole("heading", { level: 2, name: "見出し" });
        const group = heading.parentElement!;
        expect(group.tagName).toBe("HGROUP");
        expect(group).toHaveClass("text-std-24B-150");
        expect(screen.getAllByRole("heading")).toHaveLength(1);
        expect(screen.getByText("第1章").tagName).toBe("P");
        expect(screen.getByText("概要").tagName).toBe("P");
    });

    it("chip / rule / iconの装飾を付ける", () => {
        render(
            <Heading level={2} chip rule={4} icon={Settings}>
                設定
            </Heading>,
        );
        const heading = screen.getByRole("heading", { level: 2, name: "設定" });
        expect(heading).toHaveClass("relative", "before:absolute", "before:bg-primary", "border-b-4", "border-primary", "pb-4");
        expect(heading.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    });

    it("classNameとidを受け取る", () => {
        render(
            <Heading level={2} id="sec" className="mt-8">
                A
            </Heading>,
        );
        expect(screen.getByRole("heading")).toHaveAttribute("id", "sec");
        expect(screen.getByRole("heading")).toHaveClass("mt-8");
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(
            <div>
                <Heading level={1} size={28}>
                    ページ
                </Heading>
                <Heading level={2} chip shoulder="肩" subtitle="サブ">
                    節
                </Heading>
                <Heading level={3} rule={2} icon={Settings}>
                    項
                </Heading>
            </div>,
        );
        await expectNoA11yViolations(container);
    });
});
