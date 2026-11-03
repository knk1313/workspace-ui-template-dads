import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { FormField } from "./FormField";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
    it("FormFieldのラベルと関連付き、入力できる", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
            <FormField label="備考">
                <Textarea onChange={onChange} />
            </FormField>,
        );
        const textarea = screen.getByRole("textbox", { name: "備考" });
        expect(textarea).toHaveAttribute("rows", "4");
        await user.type(textarea, "あいう");
        expect(onChange).toHaveBeenCalledTimes(3);
        expect(textarea).toHaveValue("あいう");
    });

    it("サポートテキスト・エラーテキストとaria-invalid / aria-requiredを付ける", () => {
        render(
            <FormField label="理由" requirement="required" supportText="200文字以内" errorText="理由を入力してください">
                <Textarea />
            </FormField>,
        );
        const textarea = screen.getByRole("textbox", { name: /理由/ });
        expect(textarea).toHaveAccessibleDescription("200文字以内 ＊理由を入力してください");
        expect(textarea).toHaveAttribute("aria-invalid", "true");
        expect(textarea).toHaveAttribute("aria-required", "true");
    });

    it("rows / resize / blockをPropsで切り替えられる", () => {
        const { rerender } = render(<Textarea aria-label="A" rows={8} resize="none" />);
        const textarea = screen.getByRole("textbox");
        expect(textarea).toHaveAttribute("rows", "8");
        expect(textarea).toHaveClass("resize-none", "w-full");
        rerender(<Textarea aria-label="A" block={false} className="w-80" />);
        expect(screen.getByRole("textbox")).toHaveClass("resize-y", "w-80");
        expect(screen.getByRole("textbox")).not.toHaveClass("w-full");
    });

    it("counterMaxで文字数カウンターを表示し、超過するとエラー色になる（入力は止めない）", async () => {
        const user = userEvent.setup();
        render(
            <FormField label="自己紹介（5文字以内）">
                <Textarea counterMax={5} />
            </FormField>,
        );
        const textarea = screen.getByRole("textbox");
        expect(screen.getByText("0 / 5文字")).toHaveClass("text-text-muted");
        expect(textarea).toHaveAccessibleDescription("0 / 5文字");
        expect(textarea).not.toHaveAttribute("maxlength");
        await user.type(textarea, "あいうえおか");
        expect(textarea).toHaveValue("あいうえおか");
        const counter = screen.getByText("6 / 5文字（1文字超過）");
        expect(counter).toHaveClass("text-error");
        expect(textarea).toHaveAccessibleDescription("6 / 5文字（1文字超過）");
    });

    it("制御コンポーネントでもカウンターがvalueを数える（サロゲートペアは1文字）", () => {
        render(<Textarea aria-label="A" value="😀ab" onChange={() => {}} counterMax={10} />);
        expect(screen.getByText("3 / 10文字")).toBeInTheDocument();
    });

    it("disabled / readOnlyを受け付ける", () => {
        const { rerender } = render(<Textarea aria-label="A" disabled />);
        expect(screen.getByRole("textbox")).toBeDisabled();
        rerender(<Textarea aria-label="A" readOnly defaultValue="固定" />);
        expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(
            <div>
                <FormField label="備考" supportText="任意">
                    <Textarea counterMax={100} />
                </FormField>
                <FormField label="理由" errorText="理由を入力してください">
                    <Textarea />
                </FormField>
            </div>,
        );
        await expectNoA11yViolations(container);
    });
});
