import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { SearchBox } from "./SearchBox";

function Controlled({ onSubmit, onClear, size }: { onSubmit?: (v: string) => void; onClear?: boolean; size?: "sm" | "md" | "lg" }) {
    const [value, setValue] = useState("");
    return <SearchBox label="サイト内検索" value={value} onChange={setValue} onSubmit={onSubmit} onClear={onClear ? () => setValue("") : undefined} size={size} />;
}

describe("SearchBox", () => {
    it("form[role=search] の中に searchbox と検索ボタンを描画する", () => {
        render(<Controlled />);
        const form = screen.getByRole("search");
        const input = screen.getByRole("searchbox", { name: "サイト内検索" });
        expect(form).toContainElement(input);
        expect(input).toHaveAttribute("type", "search");
        expect(input).toHaveAttribute("name", "q");
        expect(screen.getByText("サイト内検索")).toHaveClass("sr-only");
        expect(screen.getByRole("button", { name: "検索" })).toHaveAttribute("type", "submit");
        expect(form.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    });

    it("入力して Enter またはボタンで onSubmit を呼ぶ（ページ遷移しない）", async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();
        render(<Controlled onSubmit={onSubmit} />);
        const input = screen.getByRole("searchbox");
        await user.type(input, "申請{Enter}");
        expect(onSubmit).toHaveBeenLastCalledWith("申請");
        await user.click(screen.getByRole("button", { name: "検索" }));
        expect(onSubmit).toHaveBeenCalledTimes(2);
    });

    it("onClear があると入力中に消去ボタンを表示する", async () => {
        const user = userEvent.setup();
        render(<Controlled onClear />);
        expect(screen.queryByRole("button", { name: "入力内容を消去" })).not.toBeInTheDocument();
        const input = screen.getByRole("searchbox");
        await user.type(input, "abc");
        await user.click(screen.getByRole("button", { name: "入力内容を消去" }));
        expect(input).toHaveValue("");
        expect(screen.queryByRole("button", { name: "入力内容を消去" })).not.toBeInTheDocument();
    });

    it("size / showLabel / buttonLabel を反映する", () => {
        const { rerender } = render(<Controlled size="sm" />);
        expect(screen.getByRole("searchbox")).toHaveClass("h-control-sm", "pl-12");
        rerender(<SearchBox label="検索語" showLabel value="" onChange={() => {}} buttonLabel="絞り込む" size="lg" />);
        expect(screen.getByText("検索語")).not.toHaveClass("sr-only");
        expect(screen.getByRole("button", { name: "絞り込む" })).toHaveClass("min-h-14");
        expect(screen.getByRole("searchbox")).toHaveClass("h-control-lg");
    });

    it("Tab で入力欄 → 検索ボタンの順に移動する", async () => {
        const user = userEvent.setup();
        render(<Controlled />);
        await user.tab();
        expect(screen.getByRole("searchbox")).toHaveFocus();
        await user.tab();
        expect(screen.getByRole("button", { name: "検索" })).toHaveFocus();
    });

    it("アクセシビリティ違反がない", async () => {
        const user = userEvent.setup();
        const { container } = render(<Controlled onClear />);
        await user.type(screen.getByRole("searchbox"), "abc");
        await expectNoA11yViolations(container);
    });
});
