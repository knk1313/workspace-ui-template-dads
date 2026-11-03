import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileText, Settings } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { CommandPalette, useCommandPaletteShortcut, type CommandItem } from "./CommandPalette";

function makeItems(onSelect = vi.fn()): CommandItem[] {
    return [
        { id: "docs", label: "ドキュメント", group: "ページ", icon: FileText, onSelect: () => onSelect("docs") },
        { id: "settings", label: "設定", group: "ページ", icon: Settings, keywords: ["settings"], onSelect: () => onSelect("settings") },
        { id: "new", label: "申請を新規作成", group: "操作", onSelect: () => onSelect("new") },
    ];
}

function Harness({ items }: { items: CommandItem[] }) {
    const [open, setOpen] = useState(false);
    useCommandPaletteShortcut(() => setOpen(true));
    return (
        <>
            <button type="button" onClick={() => setOpen(true)}>
                検索
            </button>
            <CommandPalette open={open} onClose={() => setOpen(false)} items={items} />
        </>
    );
}

describe("CommandPalette", () => {
    it("閉じているときは描画しない", () => {
        render(<CommandPalette open={false} onClose={() => {}} items={makeItems()} />);
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("dialog + combobox + listbox / group / option の構造を持つ", () => {
        render(<CommandPalette open onClose={() => {}} items={makeItems()} />);
        expect(screen.getByRole("dialog", { name: "コマンドパレット" })).toHaveAttribute("aria-modal", "true");
        const input = screen.getByRole("combobox", { name: "ページやコマンドを検索" });
        expect(input).toHaveFocus();
        expect(input).not.toHaveAttribute("placeholder");
        const listbox = screen.getByRole("listbox");
        expect(input).toHaveAttribute("aria-controls", listbox.id);
        expect(screen.getByRole("group", { name: "ページ" })).toBeInTheDocument();
        expect(screen.getByRole("group", { name: "操作" })).toBeInTheDocument();
        expect(screen.getAllByRole("option")).toHaveLength(3);
        expect(input).toHaveAttribute("aria-activedescendant", screen.getAllByRole("option")[0].id);
    });

    it("入力で絞り込み（keywords も対象）、該当なしのメッセージを出す", async () => {
        const user = userEvent.setup();
        render(<CommandPalette open onClose={() => {}} items={makeItems()} />);
        const input = screen.getByRole("combobox");
        await user.type(input, "settings");
        expect(screen.getAllByRole("option")).toHaveLength(1);
        expect(screen.getByRole("option")).toHaveTextContent("設定");
        await user.clear(input);
        await user.type(input, "存在しない");
        expect(screen.queryByRole("option")).toBeNull();
        expect(screen.getByText("該当する項目がありません")).toBeInTheDocument();
    });

    it("↓ ↑ で候補を移動し、Enter で実行して閉じる", async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        const onClose = vi.fn();
        render(<CommandPalette open onClose={onClose} items={makeItems(onSelect)} />);
        const input = screen.getByRole("combobox");
        const options = screen.getAllByRole("option");
        await user.keyboard("{ArrowDown}");
        expect(input).toHaveAttribute("aria-activedescendant", options[1].id);
        expect(options[1]).toHaveAttribute("aria-selected", "true");
        await user.keyboard("{ArrowUp}{ArrowUp}");
        expect(input).toHaveAttribute("aria-activedescendant", options[2].id);
        await user.keyboard("{Enter}");
        expect(onSelect).toHaveBeenCalledWith("new");
        expect(onClose).toHaveBeenCalled();
    });

    it("クリックで実行できる", async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(<CommandPalette open onClose={() => {}} items={makeItems(onSelect)} />);
        await user.click(screen.getByRole("option", { name: "設定" }));
        expect(onSelect).toHaveBeenCalledWith("settings");
    });

    it("Ctrl+K で開き、Esc で閉じてフォーカスを戻す", async () => {
        const user = userEvent.setup();
        render(<Harness items={makeItems()} />);
        const trigger = screen.getByRole("button", { name: "検索" });
        trigger.focus();
        await user.keyboard("{Control>}k{/Control}");
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByRole("combobox")).toHaveFocus();
        await user.keyboard("{Escape}");
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(trigger).toHaveFocus();
    });

    it("Meta+K でも開き、Tab はダイアログ内に閉じ込める", async () => {
        const user = userEvent.setup();
        render(<Harness items={makeItems()} />);
        await user.keyboard("{Meta>}k{/Meta}");
        const input = screen.getByRole("combobox");
        expect(input).toHaveFocus();
        await user.tab();
        expect(input).toHaveFocus();
        await user.tab({ shift: true });
        expect(input).toHaveFocus();
    });

    it("アクセシビリティ違反がない", async () => {
        const { baseElement } = render(<CommandPalette open onClose={() => {}} items={makeItems()} />);
        await expectNoA11yViolations(baseElement);
    });
});
