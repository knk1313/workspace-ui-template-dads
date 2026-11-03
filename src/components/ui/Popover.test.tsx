import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { Button } from "./Button";
import { Popover } from "./Popover";

function setup(placement: "bottom-start" | "bottom-end" = "bottom-start") {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const result = render(
        <div>
            <Popover trigger={<Button variant="outline">絞り込み</Button>} title="絞り込み条件" placement={placement} onOpenChange={onOpenChange}>
                <label>
                    担当者<input />
                </label>
                <Button size="sm">適用</Button>
            </Popover>
            <button type="button">次の要素</button>
        </div>,
    );
    return { user, onOpenChange, ...result };
}

const trigger = () => screen.getByRole("button", { name: "絞り込み" });

describe("Popover", () => {
    it("トリガーにaria-expanded / aria-haspopupが付き、閉じているときはパネルを描画しない", () => {
        setup();
        expect(trigger()).toHaveAttribute("aria-expanded", "false");
        expect(trigger()).toHaveAttribute("aria-haspopup", "dialog");
        expect(trigger()).not.toHaveAttribute("aria-controls");
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("クリックで開き、role=dialog（非モーダル）で見出しに関連付き、最初のフォーカス可能要素へフォーカスする", async () => {
        const { user, onOpenChange } = setup();
        await user.click(trigger());
        const dialog = screen.getByRole("dialog", { name: "絞り込み条件" });
        expect(dialog).not.toHaveAttribute("aria-modal");
        expect(dialog).toHaveClass("rounded-8", "border-border", "bg-surface", "p-4", "shadow-1", "left-0");
        expect(trigger()).toHaveAttribute("aria-expanded", "true");
        expect(trigger()).toHaveAttribute("aria-controls", dialog.id);
        expect(screen.getByLabelText("担当者")).toHaveFocus();
        expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it("placement=bottom-endで右端に揃える", async () => {
        const { user } = setup("bottom-end");
        await user.click(trigger());
        expect(screen.getByRole("dialog")).toHaveClass("right-0");
    });

    it("Escで閉じてトリガーへフォーカスを戻す", async () => {
        const { user, onOpenChange } = setup();
        await user.click(trigger());
        await user.keyboard("{Escape}");
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(trigger()).toHaveFocus();
        expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    it("外側のクリックで閉じる", async () => {
        const { user } = setup();
        await user.click(trigger());
        await user.click(screen.getByRole("button", { name: "次の要素" }));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("Tabでパネルの外へ出ると閉じる（フォーカストラップはしない）", async () => {
        const { user } = setup();
        await user.click(trigger());
        await user.tab();
        expect(screen.getByRole("button", { name: "適用" })).toHaveFocus();
        await user.tab();
        expect(screen.getByRole("button", { name: "次の要素" })).toHaveFocus();
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("トリガーをもう一度押すと閉じる", async () => {
        const { user } = setup();
        await user.click(trigger());
        await user.click(trigger());
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("フォーカス可能な要素がなければパネル自体にフォーカスする", async () => {
        const user = userEvent.setup();
        render(
            <Popover trigger={<Button>ヘルプ</Button>} title="入力のヒント">
                <p>半角で入力してください。</p>
            </Popover>,
        );
        await user.click(screen.getByRole("button", { name: "ヘルプ" }));
        expect(screen.getByRole("dialog")).toHaveFocus();
    });

    it("アクセシビリティ違反がない（開いた状態）", async () => {
        const { user, container } = setup();
        await user.click(trigger());
        await expectNoA11yViolations(container);
    });
});
