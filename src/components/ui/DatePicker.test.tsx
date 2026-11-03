import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { DatePicker, normalizeDateText, parseIso } from "./DatePicker";
import { FormField } from "./FormField";

function Controlled({ onChange, initial = "", min, max }: { onChange?: (v: string) => void; initial?: string; min?: string; max?: string }) {
    const [value, setValue] = useState(initial);
    return (
        <FormField label="開催日" supportText="西暦でYYYY-MM-DDの形式。例：2026-04-01">
            <DatePicker
                value={value}
                onChange={(v) => {
                    setValue(v);
                    onChange?.(v);
                }}
                min={min}
                max={max}
            />
        </FormField>
    );
}

describe("DatePicker", () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true, now: new Date(2026, 10, 3) }); // 2026-11-03（火）
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it("日付の解釈と正規化", () => {
        expect(parseIso("2026-02-29")).toBeUndefined();
        expect(parseIso("2028-02-29")).toEqual({ y: 2028, m: 2, d: 29 });
        expect(normalizeDateText("2026-4-1")).toBe("2026-04-01");
        expect(normalizeDateText("２０２６／４／１")).toBe("2026-04-01");
        expect(normalizeDateText("2026年4月1日")).toBe("2026-04-01");
        expect(normalizeDateText("20260401")).toBe("2026-04-01");
        expect(normalizeDateText("abc")).toBeUndefined();
    });

    it("テキスト入力でき、blurで正規化してonChangeを呼ぶ", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Controlled onChange={onChange} />);
        const input = screen.getByRole("textbox", { name: "開催日" });
        expect(input).toHaveAttribute("inputmode", "numeric");
        expect(input).toHaveAccessibleDescription("西暦でYYYY-MM-DDの形式。例：2026-04-01");
        await user.type(input, "2026-4-1");
        await user.tab();
        expect(onChange).toHaveBeenLastCalledWith("2026-04-01");
        expect(input).toHaveValue("2026-04-01");
        await user.clear(input);
        await user.tab();
        expect(onChange).toHaveBeenLastCalledWith("");
    });

    it("カレンダーボタンでダイアログを開き、gridにその月を表示する", async () => {
        const user = userEvent.setup();
        render(<Controlled />);
        const button = screen.getByRole("button", { name: "カレンダーを開く" });
        expect(button).toHaveAttribute("aria-expanded", "false");
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        await user.click(button);
        const dialog = screen.getByRole("dialog", { name: "カレンダー" });
        expect(button).toHaveAttribute("aria-expanded", "true");
        expect(within(dialog).getByText("2026年11月")).toBeInTheDocument();
        const grid = within(dialog).getByRole("grid");
        expect(within(grid).getAllByRole("columnheader")).toHaveLength(7);
        const today = within(grid).getByRole("button", { name: "2026年11月3日" });
        expect(today).toHaveAttribute("aria-current", "date");
        expect(today).toHaveFocus();
        expect(within(grid).getAllByRole("gridcell").filter((c) => c.textContent)).toHaveLength(30);
    });

    it("前月 / 次月ボタンで月を移動し、入力済みの日付を選択状態で表示する", async () => {
        const user = userEvent.setup();
        render(<Controlled initial="2026-01-31" />);
        await user.click(screen.getByRole("button", { name: "カレンダーを開く" }));
        const dialog = screen.getByRole("dialog");
        expect(within(dialog).getByText("2026年1月")).toBeInTheDocument();
        expect(within(dialog).getByRole("button", { name: "2026年1月31日" }).closest("td")).toHaveAttribute("aria-selected", "true");
        await user.click(within(dialog).getByRole("button", { name: "次の月" }));
        expect(within(dialog).getByText("2026年2月")).toBeInTheDocument();
        await user.click(within(dialog).getByRole("button", { name: "前の月" }));
        await user.click(within(dialog).getByRole("button", { name: "前の月" }));
        expect(within(dialog).getByText("2025年12月")).toBeInTheDocument();
    });

    it("矢印キー / PageUp / PageDown / Home / Endで移動し、Enterで選択して入力欄に戻る", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Controlled onChange={onChange} />);
        await user.click(screen.getByRole("button", { name: "カレンダーを開く" }));
        const dialog = screen.getByRole("dialog");
        const day = (name: string) => within(dialog).getByRole("button", { name });
        expect(day("2026年11月3日")).toHaveFocus();
        await user.keyboard("{ArrowRight}");
        expect(day("2026年11月4日")).toHaveFocus();
        await user.keyboard("{ArrowDown}");
        expect(day("2026年11月11日")).toHaveFocus();
        await user.keyboard("{ArrowLeft}{ArrowUp}");
        expect(day("2026年11月3日")).toHaveFocus();
        await user.keyboard("{Home}");
        expect(day("2026年11月1日")).toHaveFocus();
        await user.keyboard("{End}");
        expect(day("2026年11月7日")).toHaveFocus();
        await user.keyboard("{PageDown}");
        expect(within(dialog).getByText("2026年12月")).toBeInTheDocument();
        expect(day("2026年12月7日")).toHaveFocus();
        await user.keyboard("{PageUp}{PageUp}");
        expect(day("2026年10月7日")).toHaveFocus();
        // 月をまたいで前の月へ
        await user.keyboard("{ArrowUp}");
        expect(day("2026年9月30日")).toHaveFocus();
        await user.keyboard("{Enter}");
        expect(onChange).toHaveBeenLastCalledWith("2026-09-30");
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        const input = screen.getByRole("textbox");
        expect(input).toHaveValue("2026-09-30");
        expect(input).toHaveFocus();
    });

    it("Escで閉じて入力欄にフォーカスを戻す。Spaceでも選択できる", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Controlled onChange={onChange} />);
        await user.click(screen.getByRole("button", { name: "カレンダーを開く" }));
        await user.keyboard("{Escape}");
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.getByRole("textbox")).toHaveFocus();
        await user.click(screen.getByRole("button", { name: "カレンダーを開く" }));
        await user.keyboard(" ");
        expect(onChange).toHaveBeenLastCalledWith("2026-11-03");
    });

    it("min / maxの範囲外はaria-disabledで選択できない", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Controlled onChange={onChange} min="2026-11-02" max="2026-11-10" />);
        await user.click(screen.getByRole("button", { name: "カレンダーを開く" }));
        const dialog = screen.getByRole("dialog");
        const first = within(dialog).getByRole("button", { name: "2026年11月1日" });
        expect(first).toHaveAttribute("aria-disabled", "true");
        expect(within(dialog).getByRole("button", { name: "2026年11月11日" })).toHaveAttribute("aria-disabled", "true");
        expect(within(dialog).getByRole("button", { name: "2026年11月5日" })).not.toHaveAttribute("aria-disabled");
        await user.click(first);
        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("showCalendar=falseでカレンダーボタンを出さない。エラーを反映する", () => {
        render(
            <FormField label="生年月日" errorText="生年月日を入力してください">
                <DatePicker value="" onChange={() => {}} showCalendar={false} autoComplete="bday" />
            </FormField>,
        );
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
        expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    });

    it("アクセシビリティ違反がない（閉じているときと開いているとき）", async () => {
        const user = userEvent.setup();
        const { container } = render(<Controlled initial="2026-11-10" />);
        await expectNoA11yViolations(container);
        await user.click(screen.getByRole("button", { name: "カレンダーを開く" }));
        await expectNoA11yViolations(container);
    });
});
