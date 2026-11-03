import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { FormField } from "./FormField";
import { Select } from "./Select";

const PREFECTURES = [
    { value: "13", label: "東京都" },
    { value: "14", label: "神奈川県" },
    { value: "27", label: "大阪府", disabled: true },
];

describe("Select", () => {
    it("optionsから選択肢を描画し、選択でonChangeを呼ぶ", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
            <FormField label="都道府県">
                <Select options={PREFECTURES} placeholder="選択してください" onChange={onChange} />
            </FormField>,
        );
        const select = screen.getByRole("combobox", { name: "都道府県" });
        expect(screen.getAllByRole("option")).toHaveLength(4);
        expect(screen.getByRole("option", { name: "選択してください" })).toHaveValue("");
        expect(screen.getByRole("option", { name: "大阪府" })).toBeDisabled();
        await user.selectOptions(select, "14");
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(select).toHaveValue("14");
    });

    it("childrenでoptionを書ける", () => {
        render(
            <Select aria-label="並び順">
                <option value="asc">昇順</option>
                <option value="desc">降順</option>
            </Select>,
        );
        expect(screen.getAllByRole("option")).toHaveLength(2);
    });

    it("size / block / エラー / 必須を反映する", () => {
        const { rerender } = render(
            <FormField label="A" size="sm" requirement="required" errorText="選択してください">
                <Select options={PREFECTURES} />
            </FormField>,
        );
        const select = screen.getByRole("combobox");
        expect(select).toHaveClass("h-control-sm", "pr-10", "pl-4");
        expect(select).toHaveAttribute("aria-invalid", "true");
        expect(select).toHaveAttribute("aria-required", "true");
        expect(select).toHaveAccessibleDescription("＊選択してください");
        expect(select).not.toHaveClass("w-full");
        rerender(<Select aria-label="A" size="lg" block options={PREFECTURES} />);
        expect(screen.getByRole("combobox")).toHaveClass("h-control-lg", "w-full");
    });

    it("シェブロンは装飾で、クリックを通さない", () => {
        render(<Select aria-label="A" options={PREFECTURES} />);
        const svg = screen.getByRole("combobox").parentElement?.querySelector("svg");
        expect(svg).toHaveAttribute("aria-hidden", "true");
        expect(svg).toHaveClass("pointer-events-none");
    });

    it("キーボードで操作できる（Tabでフォーカス、矢印キーで選択）", async () => {
        const user = userEvent.setup();
        render(<Select aria-label="A" options={PREFECTURES} />);
        await user.tab();
        const select = screen.getByRole("combobox");
        expect(select).toHaveFocus();
        await user.selectOptions(select, "神奈川県");
        expect(select).toHaveValue("14");
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(
            <div>
                <FormField label="都道府県" requirement="required" supportText="お住まいの都道府県">
                    <Select options={PREFECTURES} placeholder="選択してください" />
                </FormField>
                <FormField label="A" errorText="選択してください">
                    <Select options={PREFECTURES} />
                </FormField>
                <Select aria-label="無効" options={PREFECTURES} disabled />
            </div>,
        );
        await expectNoA11yViolations(container);
    });
});
