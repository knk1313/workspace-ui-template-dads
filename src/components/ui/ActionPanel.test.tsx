import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { ActionPanel } from "./ActionPanel";
import { Button } from "./Button";

describe("ActionPanel", () => {
    it("DOM順 = 見た目の順はキャンセル → セカンダリー → プライマリーで、確定側は右に寄せる", () => {
        render(
            <ActionPanel
                primary={<Button>保存する</Button>}
                secondary={[
                    <Button key="draft" variant="outline">
                        下書き保存
                    </Button>,
                    <Button key="preview" variant="outline">
                        プレビュー
                    </Button>,
                ]}
                cancel={<Button variant="text">キャンセル</Button>}
            />,
        );
        const names = screen.getAllByRole("button").map((b) => b.textContent);
        expect(names).toEqual(["キャンセル", "下書き保存", "プレビュー", "保存する"]);
        const panel = screen.getByRole("group", { name: "操作" });
        expect(panel).toHaveClass("flex", "flex-wrap");
        expect(screen.getByText("保存する").closest("button")?.parentElement).toHaveClass("ml-auto", "justify-end");
    });

    it("Tab順は見た目の順（キャンセル → セカンダリー → プライマリー）", async () => {
        const user = userEvent.setup();
        const onSave = vi.fn();
        render(<ActionPanel primary={<Button onClick={onSave}>保存する</Button>} secondary={<Button variant="outline">下書き保存</Button>} cancel={<Button variant="text">キャンセル</Button>} />);
        await user.tab();
        expect(screen.getByRole("button", { name: "キャンセル" })).toHaveFocus();
        await user.tab();
        expect(screen.getByRole("button", { name: "下書き保存" })).toHaveFocus();
        await user.tab();
        expect(screen.getByRole("button", { name: "保存する" })).toHaveFocus();
        await user.keyboard("{Enter}");
        expect(onSave).toHaveBeenCalledTimes(1);
    });

    it("プライマリーだけでも描画でき、stickyとlabelを反映する", () => {
        render(<ActionPanel primary={<Button>次へ</Button>} sticky label="フォームの操作" className="px-4" />);
        const panel = screen.getByRole("group", { name: "フォームの操作" });
        expect(panel).toHaveClass("sticky", "bottom-0", "border-t", "bg-surface", "px-4");
        expect(screen.getAllByRole("button")).toHaveLength(1);
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(
            <ActionPanel primary={<Button>保存する</Button>} secondary={<Button variant="outline">下書き保存</Button>} cancel={<Button variant="text">キャンセル</Button>} sticky />,
        );
        await expectNoA11yViolations(container);
    });
});
