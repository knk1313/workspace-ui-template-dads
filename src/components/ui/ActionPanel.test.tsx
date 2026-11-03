import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { ActionPanel } from "./ActionPanel";
import { Button } from "./Button";

describe("ActionPanel", () => {
    it("DOM 順はセカンダリー → プライマリー → キャンセル、md 以上は order で並べ替える", () => {
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
        expect(names).toEqual(["下書き保存", "プレビュー", "保存する", "キャンセル"]);
        const panel = screen.getByRole("group", { name: "操作" });
        expect(panel).toHaveClass("flex-col", "md:flex-row", "md:justify-end");
        expect(screen.getByText("下書き保存").closest("button")?.parentElement).toHaveClass("md:order-2");
        expect(screen.getByText("保存する").closest("button")?.parentElement).toHaveClass("md:order-3");
        expect(screen.getByText("キャンセル").closest("button")?.parentElement).toHaveClass("md:order-1", "md:mr-auto");
    });

    it("Tab 順は DOM 順（セカンダリー → プライマリー → キャンセル）", async () => {
        const user = userEvent.setup();
        const onSave = vi.fn();
        render(<ActionPanel primary={<Button onClick={onSave}>保存する</Button>} secondary={<Button variant="outline">下書き保存</Button>} cancel={<Button variant="text">キャンセル</Button>} />);
        await user.tab();
        expect(screen.getByRole("button", { name: "下書き保存" })).toHaveFocus();
        await user.tab();
        expect(screen.getByRole("button", { name: "保存する" })).toHaveFocus();
        await user.keyboard("{Enter}");
        expect(onSave).toHaveBeenCalledTimes(1);
        await user.tab();
        expect(screen.getByRole("button", { name: "キャンセル" })).toHaveFocus();
    });

    it("プライマリーだけでも描画でき、sticky と label を反映する", () => {
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
