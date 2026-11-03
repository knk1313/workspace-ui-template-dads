import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { Switch } from "./Switch";

function Controlled({ onChange, initial = false }: { onChange?: (v: boolean) => void; initial?: boolean }) {
    const [checked, setChecked] = useState(initial);
    return (
        <Switch
            label="通知"
            checked={checked}
            onChange={(v) => {
                setChecked(v);
                onChange?.(v);
            }}
        />
    );
}

describe("Switch", () => {
    it("role=switch と aria-checked で描画し、ラベルが名前になる", () => {
        render(<Controlled />);
        const sw = screen.getByRole("switch", { name: "通知" });
        expect(sw).toHaveAttribute("aria-checked", "false");
        expect(sw).toHaveAttribute("type", "button");
        expect(screen.getByText("通知").tagName).toBe("LABEL");
    });

    it("クリックで onChange に反転した値を渡す", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Controlled onChange={onChange} />);
        await user.click(screen.getByRole("switch"));
        expect(onChange).toHaveBeenLastCalledWith(true);
        expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
        // ラベルをクリックしても切り替わる（label for）
        await user.click(screen.getByText("通知"));
        expect(onChange).toHaveBeenLastCalledWith(false);
    });

    it("Space と Enter で切り替えられる", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Controlled onChange={onChange} />);
        await user.tab();
        expect(screen.getByRole("switch")).toHaveFocus();
        await user.keyboard(" ");
        expect(onChange).toHaveBeenLastCalledWith(true);
        await user.keyboard("{Enter}");
        expect(onChange).toHaveBeenLastCalledWith(false);
        expect(onChange).toHaveBeenCalledTimes(2);
    });

    it("On のときチェックアイコンを表示する（group-aria-checked）", () => {
        render(<Controlled initial />);
        const sw = screen.getByRole("switch");
        expect(sw).toHaveAttribute("aria-checked", "true");
        expect(sw.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    });

    it("disabled のとき押せない。hideLabel でラベルを視覚的に隠す", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Switch label="位置情報" checked={false} onChange={onChange} disabled hideLabel />);
        const sw = screen.getByRole("switch", { name: "位置情報" });
        expect(sw).toBeDisabled();
        expect(screen.getByText("位置情報")).toHaveClass("sr-only");
        await user.click(sw);
        expect(onChange).not.toHaveBeenCalled();
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(
            <div>
                <Controlled />
                <Controlled initial />
                <Switch label="無効" checked={false} onChange={() => {}} disabled />
            </div>,
        );
        await expectNoA11yViolations(container);
    });
});
