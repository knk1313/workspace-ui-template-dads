import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Trash2 } from "lucide-react";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { Icon } from "./Icon";
import { Tooltip } from "./Tooltip";

function setup() {
    const user = userEvent.setup();
    const result = render(
        <div>
            <Tooltip content="選択した項目を削除します" delay={10}>
                <button type="button" aria-label="削除">
                    <Icon icon={Trash2} />
                </button>
            </Tooltip>
            <button type="button">次の要素</button>
        </div>,
    );
    return { user, ...result };
}

const tooltip = () => screen.getByRole("tooltip");
const button = () => screen.getByRole("button", { name: "削除" });

describe("Tooltip", () => {
    it("子要素に aria-describedby を付け、非表示のときもテキストを支援技術に渡す", () => {
        setup();
        expect(button()).toHaveAccessibleDescription("選択した項目を削除します");
        expect(button()).toHaveAttribute("aria-describedby", tooltip().id);
        expect(tooltip()).toHaveClass("sr-only");
    });

    it("ホバーで表示し、離れると隠す", async () => {
        const { user } = setup();
        await user.hover(button());
        await waitFor(() => expect(tooltip()).not.toHaveClass("sr-only"));
        expect(tooltip()).toHaveClass("bg-text-strong", "text-text-inverse", "rounded-4", "text-14");
        await user.unhover(button());
        expect(tooltip()).toHaveClass("sr-only");
    });

    it("フォーカスで表示し、Esc で隠し、フォーカスが外れても隠す", async () => {
        const { user } = setup();
        await user.tab();
        expect(button()).toHaveFocus();
        await waitFor(() => expect(tooltip()).not.toHaveClass("sr-only"));
        await user.keyboard("{Escape}");
        expect(tooltip()).toHaveClass("sr-only");

        await user.tab({ shift: true });
        await user.tab();
        await waitFor(() => expect(tooltip()).not.toHaveClass("sr-only"));
        await user.tab();
        expect(tooltip()).toHaveClass("sr-only");
    });

    it("既存の aria-describedby を残す", () => {
        render(
            <div>
                <p id="hint">補足</p>
                <Tooltip content="ツールチップ">
                    <button type="button" aria-describedby="hint">
                        操作
                    </button>
                </Tooltip>
            </div>,
        );
        expect(screen.getByRole("button", { name: "操作" })).toHaveAccessibleDescription("補足 ツールチップ");
    });

    it("アクセシビリティ違反がない", async () => {
        const { user, container } = setup();
        await expectNoA11yViolations(container);
        await user.hover(button());
        await waitFor(() => expect(tooltip()).not.toHaveClass("sr-only"));
        await expectNoA11yViolations(container);
    });
});
