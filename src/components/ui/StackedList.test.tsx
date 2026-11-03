import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { StackedList, StackedListItem } from "./StackedList";

describe("StackedList", () => {
    it("ul / li で描画し、タイトル・説明・メタを表示する", () => {
        render(
            <StackedList>
                <StackedListItem title="利用者登録の申請" description="山田 太郎" meta="10月1日" />
                <StackedListItem title="住所変更の申請" />
            </StackedList>,
        );
        const list = screen.getByRole("list");
        expect(list).toHaveClass("divide-y", "divide-border");
        expect(screen.getAllByRole("listitem")).toHaveLength(2);
        expect(screen.getByText("利用者登録の申請")).toBeInTheDocument();
        expect(screen.getByText("山田 太郎")).toBeInTheDocument();
        expect(screen.getByText("10月1日")).toBeInTheDocument();
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("href でタイトルがリンクになり、行全体に領域が広がる", () => {
        render(
            <MemoryRouter>
                <StackedList>
                    <StackedListItem title="利用者登録の申請" href="/applications/1" leading={<span data-testid="avatar" />} />
                </StackedList>
            </MemoryRouter>,
        );
        const link = screen.getByRole("link", { name: "利用者登録の申請" });
        expect(link).toHaveAttribute("href", "/applications/1");
        expect(link).toHaveClass("after:absolute", "after:inset-0");
        const item = screen.getByRole("listitem");
        expect(item).toHaveClass("relative", "hover:bg-surface-hover");
        expect(screen.getByTestId("avatar")).toBeInTheDocument();
    });

    it("onClick でタイトルがボタンになり、クリックとキーボードで呼ばれる", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        render(
            <StackedList>
                <StackedListItem title="詳細を開く" onClick={onClick} />
            </StackedList>,
        );
        const button = screen.getByRole("button", { name: "詳細を開く" });
        await user.tab();
        expect(button).toHaveFocus();
        await user.keyboard("{Enter}");
        expect(onClick).toHaveBeenCalledTimes(1);
        await user.click(button);
        expect(onClick).toHaveBeenCalledTimes(2);
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(
            <MemoryRouter>
                <StackedList>
                    <StackedListItem title="A" description="a" meta="1" href="/a" />
                    <StackedListItem title="B" onClick={() => {}} />
                    <StackedListItem title="C" />
                </StackedList>
            </MemoryRouter>,
        );
        await expectNoA11yViolations(container);
    });
});
