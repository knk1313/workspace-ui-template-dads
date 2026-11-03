import { render, screen } from "@testing-library/react";
import { Clock } from "lucide-react";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { ChipLabel, StatusChip } from "./ChipLabel";

describe("ChipLabel", () => {
    it("テキストを描画し、既定は outlined / gray", () => {
        render(<ChipLabel>受付中</ChipLabel>);
        const chip = screen.getByText("受付中").parentElement!;
        expect(chip).toHaveAttribute("data-style", "outlined");
        expect(chip).toHaveAttribute("data-color", "gray");
        expect(chip).toHaveClass("min-h-8", "rounded-8", "text-16", "leading-none", "tracking-2", "border", "bg-surface", "border-solid-gray-700", "text-solid-gray-800", "px-1.75", "py-0.75");
    });

    it("style ごとに DADS の色（非テキスト / 背景 / 文字 / 濃い文字）を割り当てる", () => {
        const { rerender } = render(
            <ChipLabel style="text" color="blue">
                A
            </ChipLabel>,
        );
        const chip = () => screen.getByText("A").parentElement!;
        expect(chip()).toHaveClass("text-blue-700", "px-2", "py-1");
        expect(chip()).not.toHaveClass("border");

        rerender(
            <ChipLabel style="outlined" color="blue">
                A
            </ChipLabel>,
        );
        expect(chip()).toHaveClass("border-blue-700", "text-blue-700", "bg-surface");

        rerender(
            <ChipLabel style="filled-1" color="blue">
                A
            </ChipLabel>,
        );
        expect(chip()).toHaveClass("border-blue-700", "bg-blue-50", "text-blue-800");

        rerender(
            <ChipLabel style="filled-2" color="blue">
                A
            </ChipLabel>,
        );
        expect(chip()).toHaveClass("bg-blue-700", "text-text-inverse", "border-transparent");

        rerender(
            <ChipLabel style="filled-1" color="light-blue">
                A
            </ChipLabel>,
        );
        expect(chip()).toHaveClass("border-light-blue-800", "bg-light-blue-50", "text-light-blue-900");
    });

    it("icon は装飾として描画し、filled-1 では非テキスト色にする", () => {
        render(
            <ChipLabel style="filled-1" color="green" icon={Clock}>
                審査中
            </ChipLabel>,
        );
        const svg = screen.getByText("審査中").parentElement!.querySelector("svg")!;
        expect(svg).toHaveAttribute("aria-hidden", "true");
        expect(svg).toHaveClass("size-icon-lg", "text-green-800");
        expect(screen.getByText("審査中").parentElement).toHaveTextContent("審査中");
    });

    it("StatusChip は意味に応じた色を割り当て、既定は filled-1", () => {
        const { rerender } = render(<StatusChip status="success">完了</StatusChip>);
        const chip = () => screen.getByText(/./).closest("[data-status]")!;
        expect(chip()).toHaveAttribute("data-color", "green");
        expect(chip()).toHaveAttribute("data-style", "filled-1");
        rerender(<StatusChip status="error">差戻し</StatusChip>);
        expect(chip()).toHaveAttribute("data-color", "red");
        rerender(<StatusChip status="warning">要確認</StatusChip>);
        expect(chip()).toHaveAttribute("data-color", "yellow");
        rerender(<StatusChip status="info">新着</StatusChip>);
        expect(chip()).toHaveAttribute("data-color", "blue");
        rerender(
            <StatusChip status="neutral" style="outlined">
                下書き
            </StatusChip>,
        );
        expect(chip()).toHaveAttribute("data-color", "gray");
        expect(chip()).toHaveAttribute("data-style", "outlined");
    });

    it("className で拡張できる", () => {
        render(<ChipLabel className="ml-2">A</ChipLabel>);
        expect(screen.getByText("A").parentElement).toHaveClass("ml-2", "rounded-8");
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(
            <div>
                <ChipLabel style="text">text</ChipLabel>
                <ChipLabel style="outlined" color="purple">
                    outlined
                </ChipLabel>
                <ChipLabel style="filled-1" color="orange" icon={Clock}>
                    filled-1
                </ChipLabel>
                <ChipLabel style="filled-2" color="red">
                    filled-2
                </ChipLabel>
                <StatusChip status="success">完了</StatusChip>
            </div>,
        );
        await expectNoA11yViolations(container);
    });
});
