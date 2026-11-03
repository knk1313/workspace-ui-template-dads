import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { Combobox } from "./Combobox";
import { FormField } from "./FormField";

const OPTIONS = [
    { value: "chiyoda", label: "千代田区" },
    { value: "chuo", label: "中央区" },
    { value: "minato", label: "港区" },
    { value: "shinjuku", label: "新宿区" },
];

function Controlled({ onChange, initial = "" }: { onChange?: (v: string) => void; initial?: string }) {
    const [value, setValue] = useState(initial);
    return (
        <FormField label="市区町村" supportText="文字を入力すると絞り込めます">
            <Combobox
                options={OPTIONS}
                value={value}
                onChange={(v) => {
                    setValue(v);
                    onChange?.(v);
                }}
                name="city"
            />
        </FormField>
    );
}

describe("Combobox", () => {
    it("APG の属性で描画する（combobox / listbox / option）", () => {
        render(<Controlled />);
        const input = screen.getByRole("combobox", { name: "市区町村" });
        expect(input).toHaveAttribute("aria-expanded", "false");
        expect(input).toHaveAttribute("aria-autocomplete", "list");
        expect(input).toHaveAccessibleDescription("文字を入力すると絞り込めます");
        const listbox = document.getElementById(input.getAttribute("aria-controls")!);
        expect(listbox).toHaveAttribute("role", "listbox");
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument(); // 閉じているときは hidden
    });

    it("入力で候補を絞り込み、クリックで確定する", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Controlled onChange={onChange} />);
        const input = screen.getByRole("combobox");
        await user.type(input, "区");
        expect(input).toHaveAttribute("aria-expanded", "true");
        expect(screen.getAllByRole("option")).toHaveLength(4);
        await user.clear(input);
        await user.type(input, "新");
        expect(screen.getAllByRole("option")).toHaveLength(1);
        await user.click(screen.getByRole("option", { name: "新宿区" }));
        expect(onChange).toHaveBeenLastCalledWith("shinjuku");
        expect(input).toHaveValue("新宿区");
        expect(input).toHaveAttribute("aria-expanded", "false");
        expect(document.querySelector("input[name='city']")).toHaveValue("shinjuku");
    });

    it("候補がないときはメッセージを表示する", async () => {
        const user = userEvent.setup();
        render(<Controlled />);
        await user.type(screen.getByRole("combobox"), "zzz");
        expect(screen.queryAllByRole("option")).toHaveLength(0);
        expect(screen.getByText("該当する選択肢がありません")).toBeInTheDocument();
    });

    it("↓↑ で候補を移動し（aria-activedescendant）、Enter で確定、Esc で閉じる", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Controlled onChange={onChange} />);
        const input = screen.getByRole("combobox");
        await user.tab();
        expect(input).toHaveFocus();
        await user.keyboard("{ArrowDown}");
        expect(input).toHaveAttribute("aria-expanded", "true");
        expect(input).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: "千代田区" }).id);
        await user.keyboard("{ArrowDown}{ArrowDown}");
        expect(input).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: "港区" }).id);
        expect(screen.getByRole("option", { name: "港区" })).toHaveClass("bg-solid-gray-50");
        await user.keyboard("{ArrowUp}");
        expect(input).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: "中央区" }).id);
        await user.keyboard("{Enter}");
        expect(onChange).toHaveBeenLastCalledWith("chuo");
        expect(input).toHaveValue("中央区");
        expect(input).toHaveAttribute("aria-expanded", "false");
        expect(input).toHaveFocus();

        // 再度開くと選択中が aria-selected になり、Esc で入力が選択中の値に戻る
        await user.keyboard("{ArrowDown}");
        expect(screen.getByRole("option", { name: "中央区" })).toHaveAttribute("aria-selected", "true");
        await user.type(input, "港");
        expect(input).toHaveValue("中央区港");
        await user.keyboard("{Escape}");
        expect(input).toHaveAttribute("aria-expanded", "false");
        expect(input).toHaveValue("中央区");
    });

    it("入力を空にして離れると未選択になり、一致しない文字列は捨てる", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
            <div>
                <Controlled onChange={onChange} initial="minato" />
                <button type="button">次へ</button>
            </div>,
        );
        const input = screen.getByRole("combobox");
        expect(input).toHaveValue("港区");
        await user.clear(input);
        await user.tab();
        expect(onChange).toHaveBeenLastCalledWith("");
        expect(screen.getByRole("button", { name: "次へ" })).toHaveFocus();
        await user.click(input);
        await user.type(input, "存在しない");
        await user.tab();
        expect(input).toHaveValue("");
    });

    it("外側クリックで閉じる", async () => {
        const user = userEvent.setup();
        render(
            <div>
                <Controlled />
                <p>外側</p>
            </div>,
        );
        const input = screen.getByRole("combobox");
        await user.click(input);
        expect(input).toHaveAttribute("aria-expanded", "true");
        await user.click(screen.getByText("外側"));
        expect(input).toHaveAttribute("aria-expanded", "false");
    });

    it("エラー・サイズを反映する", () => {
        render(
            <FormField label="A" size="lg" requirement="required" errorText="選択してください">
                <Combobox options={OPTIONS} value="" onChange={() => {}} />
            </FormField>,
        );
        const input = screen.getByRole("combobox");
        expect(input).toHaveClass("h-control-lg");
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(input).toHaveAttribute("aria-required", "true");
    });

    it("アクセシビリティ違反がない（閉じているときと開いているとき）", async () => {
        const user = userEvent.setup();
        const { container } = render(<Controlled initial="chuo" />);
        await expectNoA11yViolations(container);
        await user.click(screen.getByRole("combobox"));
        await user.keyboard("{ArrowDown}");
        await expectNoA11yViolations(container);
    });
});
