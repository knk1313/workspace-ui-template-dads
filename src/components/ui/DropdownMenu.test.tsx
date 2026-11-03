import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { DropdownMenu, type DropdownMenuEntry, type DropdownMenuProps } from "./DropdownMenu";

function setup(props: Partial<DropdownMenuProps> = {}) {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onCopy = vi.fn();
    const onDelete = vi.fn();
    const onArchive = vi.fn();
    const items: DropdownMenuEntry[] = [
        { label: "編集", icon: Pencil, onSelect: onEdit },
        { label: "複製", icon: Copy, onSelect: onCopy },
        { label: "アーカイブ", onSelect: onArchive, disabled: true },
        "separator",
        { label: "削除", icon: Trash2, onSelect: onDelete, danger: true },
    ];
    const result = render(
        <div>
            <DropdownMenu label="操作" items={items} {...props} />
            <button type="button">次の要素</button>
        </div>,
    );
    return { user, onEdit, onCopy, onDelete, onArchive, ...result };
}

const trigger = () => screen.getByRole("button", { name: "操作" });
const menuItems = () => screen.getAllByRole("menuitem");

describe("DropdownMenu", () => {
    it("トリガーはaria-haspopup=menuを持ち、閉じているときはメニューを描画しない", () => {
        setup();
        expect(trigger()).toHaveAttribute("aria-haspopup", "menu");
        expect(trigger()).toHaveAttribute("aria-expanded", "false");
        expect(trigger()).not.toHaveAttribute("aria-controls");
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("クリックで開き、最初の項目にフォーカスし、aria-expanded / aria-controlsが付く", async () => {
        const { user } = await setup();
        await user.click(trigger());
        const menu = screen.getByRole("menu", { name: "操作" });
        expect(trigger()).toHaveAttribute("aria-expanded", "true");
        expect(trigger()).toHaveAttribute("aria-controls", menu.id);
        expect(menu).toHaveClass("rounded-8", "border-border", "shadow-1", "py-4", "max-h-popup-max");
        expect(menuItems()).toHaveLength(4);
        expect(menuItems()[0]).toHaveFocus();
        expect(screen.getByRole("separator")).toBeInTheDocument();
        await user.click(trigger());
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("項目を選ぶとonSelectが呼ばれて閉じ、トリガーへフォーカスが戻る", async () => {
        const { user, onEdit } = setup();
        await user.click(trigger());
        await user.click(screen.getByRole("menuitem", { name: "編集" }));
        expect(onEdit).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
        expect(trigger()).toHaveFocus();
    });

    it("矢印キーで移動（端で折り返す）、Home / End、Enter / Spaceで実行する", async () => {
        const { user, onCopy, onDelete } = setup();
        trigger().focus();
        await user.keyboard("{ArrowDown}");
        expect(menuItems()[0]).toHaveFocus();
        await user.keyboard("{ArrowDown}");
        expect(menuItems()[1]).toHaveFocus();
        await user.keyboard("{ArrowUp}{ArrowUp}");
        expect(menuItems()[3]).toHaveFocus();
        await user.keyboard("{ArrowDown}");
        expect(menuItems()[0]).toHaveFocus();
        await user.keyboard("{End}");
        expect(menuItems()[3]).toHaveFocus();
        await user.keyboard("{Home}");
        expect(menuItems()[0]).toHaveFocus();
        await user.keyboard("{ArrowDown}{Enter}");
        expect(onCopy).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();

        await user.keyboard("{ArrowUp}");
        expect(menuItems()[3]).toHaveFocus();
        await user.keyboard(" ");
        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it("Escで閉じてトリガーへ戻り、Tabで閉じて次の要素へ移る", async () => {
        const { user } = setup();
        await user.click(trigger());
        await user.keyboard("{Escape}");
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
        expect(trigger()).toHaveFocus();

        await user.click(trigger());
        await user.tab();
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "次の要素" })).toHaveFocus();
    });

    it("文字の入力で先頭一致する項目へ移る", async () => {
        const { user } = setup();
        await user.click(trigger());
        await user.keyboard("削");
        expect(screen.getByRole("menuitem", { name: "削除" })).toHaveFocus();
        await user.keyboard("複");
        expect(screen.getByRole("menuitem", { name: "複製" })).toHaveFocus();
    });

    it("外側のクリックで閉じる", async () => {
        const { user } = setup();
        await user.click(trigger());
        await user.click(screen.getByRole("button", { name: "次の要素" }));
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("dangerはエラー色、disabledはaria-disabledで選べない", async () => {
        const { user, onArchive } = setup();
        await user.click(trigger());
        expect(screen.getByRole("menuitem", { name: "削除" })).toHaveClass("text-error");
        const archive = screen.getByRole("menuitem", { name: "アーカイブ" });
        expect(archive).toHaveAttribute("aria-disabled", "true");
        expect(archive).toHaveClass("text-text-disabled");
        await user.click(archive);
        expect(onArchive).not.toHaveBeenCalled();
        expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("トリガーのスタイルとサイズ、揃え位置を切り替えられる", async () => {
        const { user, rerender } = setup({ style: "outlined", size: "sm", align: "end" });
        expect(trigger()).toHaveClass("border", "tap-area", "min-h-9");
        await user.click(trigger());
        expect(screen.getByRole("menu")).toHaveClass("right-0");
        rerender(
            <div>
                <DropdownMenu label="操作" items={[]} style="filled" />
            </div>,
        );
        expect(trigger()).toHaveClass("bg-surface-muted", "min-h-11");
    });

    it("iconOnlyは縦三点リーダーのアイコンだけで、labelがaria-labelになる", async () => {
        const { user } = setup({ iconOnly: true });
        const button = screen.getByRole("button", { name: "操作" });
        expect(button).toHaveAttribute("aria-label", "操作");
        expect(button).toHaveClass("size-target");
        expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
        await user.click(button);
        expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("アクセシビリティ違反がない（開いた状態）", async () => {
        const { user, container } = setup();
        await user.click(trigger());
        await expectNoA11yViolations(container);
    });
});
