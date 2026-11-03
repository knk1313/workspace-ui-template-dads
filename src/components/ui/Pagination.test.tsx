import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { getPageItems, Pagination } from "./Pagination";

describe("Pagination", () => {
    it("navと前 / 次ボタン、ページ番号を描画し、現在ページにaria-currentを付ける", () => {
        render(<Pagination page={3} totalPages={5} onChange={() => {}} />);
        expect(screen.getByRole("navigation", { name: "ページ送り" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "前のページ" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "次のページ" })).toBeInTheDocument();
        const current = screen.getByRole("button", { name: "3ページ目" });
        expect(current).toHaveAttribute("aria-current", "page");
        expect(current).toHaveClass("bg-primary");
        expect(screen.getByRole("button", { name: "1ページ目" })).not.toHaveAttribute("aria-current");
    });

    it("ページ番号・前 / 次のクリックでonChangeを呼ぶ", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Pagination page={3} totalPages={10} onChange={onChange} />);
        await user.click(screen.getByRole("button", { name: "4ページ目" }));
        expect(onChange).toHaveBeenLastCalledWith(4);
        await user.click(screen.getByRole("button", { name: "前のページ" }));
        expect(onChange).toHaveBeenLastCalledWith(2);
        await user.click(screen.getByRole("button", { name: "次のページ" }));
        expect(onChange).toHaveBeenLastCalledWith(4);
    });

    it("先頭では「前」、末尾では「次」がaria-disabledになり、押しても何も起きないがTabで到達できる", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        const { rerender } = render(<Pagination page={1} totalPages={3} onChange={onChange} />);
        const prev = screen.getByRole("button", { name: "前のページ" });
        expect(prev).toHaveAttribute("aria-disabled", "true");
        expect(prev).not.toBeDisabled();
        await user.tab();
        expect(prev).toHaveFocus();
        await user.click(prev);
        expect(onChange).not.toHaveBeenCalled();

        rerender(<Pagination page={3} totalPages={3} onChange={onChange} />);
        const next = screen.getByRole("button", { name: "次のページ" });
        expect(next).toHaveAttribute("aria-disabled", "true");
        await user.click(next);
        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByRole("button", { name: "前のページ" })).not.toHaveAttribute("aria-disabled");
    });

    it("ページ数が多いときは省略し、先頭と末尾は常に表示する", () => {
        expect(getPageItems(1, 20, 1)).toEqual([1, 2, 3, 4, 5, "ellipsis-end", 20]);
        expect(getPageItems(10, 20, 1)).toEqual([1, "ellipsis-start", 9, 10, 11, "ellipsis-end", 20]);
        expect(getPageItems(20, 20, 1)).toEqual([1, "ellipsis-start", 16, 17, 18, 19, 20]);
        expect(getPageItems(4, 20, 1)).toEqual([1, 2, 3, 4, 5, "ellipsis-end", 20]);
        expect(getPageItems(5, 20, 2)).toEqual([1, 2, 3, 4, 5, 6, 7, "ellipsis-end", 20]);
        expect(getPageItems(2, 5, 1)).toEqual([1, 2, 3, 4, 5]);

        render(<Pagination page={10} totalPages={20} onChange={() => {}} />);
        expect(screen.getAllByText("…")).toHaveLength(2);
        expect(screen.getByRole("button", { name: "1ページ目" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "20ページ目" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "5ページ目" })).not.toBeInTheDocument();
    });

    it("showCounterでページ番号の代わりに「n / Nページ」を表示する", () => {
        render(<Pagination page={2} totalPages={7} onChange={() => {}} showCounter />);
        expect(screen.getByRole("navigation")).toHaveTextContent("2 / 7ページ");
        expect(screen.queryByRole("button", { name: "2ページ目" })).not.toBeInTheDocument();
    });

    it("sizeに応じて矢印ボタンの大きさとタップ領域を変える", () => {
        const { rerender } = render(<Pagination page={1} totalPages={3} onChange={() => {}} />);
        expect(screen.getByRole("button", { name: "次のページ" })).toHaveClass("size-11", "rounded-full");
        rerender(<Pagination page={1} totalPages={3} onChange={() => {}} size="md" />);
        expect(screen.getByRole("button", { name: "次のページ" })).toHaveClass("size-8", "tap-area");
        rerender(<Pagination page={1} totalPages={3} onChange={() => {}} size="sm" />);
        expect(screen.getByRole("button", { name: "次のページ" })).toHaveClass("size-6", "tap-area");
    });

    it("キーボード（Enter）でページを変えられる", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Pagination page={1} totalPages={3} onChange={onChange} />);
        await user.tab(); // 前（aria-disabled）
        await user.tab(); // 1 ページ目
        await user.tab(); // 2 ページ目
        expect(screen.getByRole("button", { name: "2ページ目" })).toHaveFocus();
        await user.keyboard("{Enter}");
        expect(onChange).toHaveBeenCalledWith(2);
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(
            <div>
                <Pagination page={5} totalPages={20} onChange={() => {}} />
                <Pagination page={1} totalPages={3} onChange={() => {}} showCounter label="記事のページ送り" size="sm" />
            </div>,
        );
        await expectNoA11yViolations(container);
    });
});
