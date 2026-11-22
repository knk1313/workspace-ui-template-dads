import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { setMockOptions } from "@/api/mock";
import { expectNoA11yViolations } from "@/test/axe";
import { AssignDialog } from "./AssignDialog";

describe("AssignDialog", () => {
    it("職員の一覧を読み込んでいる間は知らせ、読み込んだら先頭の職員を選んで送れる", async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();
        render(<AssignDialog count={1} onClose={() => {}} onSubmit={onSubmit} />);
        expect(screen.getByRole("option", { name: "読み込んでいます" })).toBeInTheDocument();
        const first = await screen.findByRole("option", { name: "佐藤 花子" });
        expect((first as HTMLOptionElement).selected).toBe(true);
        await user.click(screen.getByRole("button", { name: "変更する" }));
        expect(onSubmit).toHaveBeenCalledWith("佐藤 花子");
    });

    it("職員の一覧を読み込めなかったらエラーを出し、再読み込みで選べるようになる", async () => {
        const user = userEvent.setup();
        setMockOptions({ fail: true, slow: false });
        render(<AssignDialog count={1} onClose={() => {}} onSubmit={() => {}} />);
        expect(await screen.findByRole("heading", { name: "担当者の一覧を読み込めませんでした" })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "変更する" })).not.toBeInTheDocument();
        await expectNoA11yViolations(document.body);
        setMockOptions({ fail: false, slow: false });
        await user.click(screen.getByRole("button", { name: "再読み込み" }));
        expect(await screen.findByRole("option", { name: "佐藤 花子" })).toBeInTheDocument();
    });
});
