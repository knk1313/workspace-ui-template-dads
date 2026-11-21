import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { Checkbox } from "./Checkbox";
import { FormField } from "./FormField";

function Controlled({ onChange }: { onChange?: (checked: boolean) => void }) {
    const [checked, setChecked] = useState(false);
    return (
        <Checkbox
            checked={checked}
            onChange={(e) => {
                setChecked(e.target.checked);
                onChange?.(e.target.checked);
            }}
        >
            利用規約に同意する
        </Checkbox>
    );
}

describe("Checkbox", () => {
    it("ラベルで名前が付き、クリックとSpaceで切り替わる", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Controlled onChange={onChange} />);
        const box = screen.getByRole("checkbox", { name: "利用規約に同意する" });
        await user.click(screen.getByText("利用規約に同意する"));
        expect(box).toBeChecked();
        await user.keyboard(" ");
        expect(box).not.toBeChecked();
        expect(onChange).toHaveBeenCalledTimes(2);
    });

    it("indeterminateを入力の状態に反映する", () => {
        render(<Checkbox indeterminate aria-label="すべて選択" />);
        expect(screen.getByRole("checkbox", { name: "すべて選択" })).toBePartiallyChecked();
    });

    it("FormFieldの中では、エラーと説明を入力に結び付ける", () => {
        render(
            <FormField label="確認事項" as="fieldset" errorText="チェックを入れてください" supportText="内容を確かめてから選んでください">
                <Checkbox>記載内容に誤りがないことを確かめた</Checkbox>
            </FormField>,
        );
        const box = screen.getByRole("checkbox", { name: "記載内容に誤りがないことを確かめた" });
        expect(box).toHaveAttribute("aria-invalid", "true");
    });

    it("無効のときは操作できない", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
            <Checkbox disabled onChange={onChange}>
                選べない項目
            </Checkbox>,
        );
        await user.click(screen.getByText("選べない項目"));
        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByRole("checkbox", { name: "選べない項目" })).toBeDisabled();
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(<Controlled />);
        await expectNoA11yViolations(container);
    });
});
