import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { Button } from "./Button";
import { Drawer, type DrawerProps } from "./Drawer";

type HarnessProps = Partial<Omit<DrawerProps, "open" | "onClose" | "children">>;

function Harness(props: HarnessProps) {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <button type="button" onClick={() => setOpen(true)}>
                開く
            </button>
            <Drawer open={open} onClose={() => setOpen(false)} title="絞り込み" footer={<Button onClick={() => setOpen(false)}>適用する</Button>} {...props}>
                <label>
                    キーワード <input />
                </label>
            </Drawer>
        </div>
    );
}

async function openDrawer(props: HarnessProps = {}) {
    const user = userEvent.setup();
    const result = render(<Harness {...props} />);
    await user.click(screen.getByRole("button", { name: "開く" }));
    return { user, ...result };
}

describe("Drawer", () => {
    it("開くと role=dialog（aria-modal）で見出しに関連付き、閉じるボタンにフォーカスする", async () => {
        await openDrawer();
        const dialog = screen.getByRole("dialog", { name: "絞り込み" });
        expect(dialog).toHaveAttribute("aria-modal", "true");
        expect(dialog).toHaveClass("w-drawer", "shadow-2", "bg-surface");
        expect(dialog.parentElement).toHaveClass("bg-scrim-light", "justify-end");
        expect(screen.getByRole("button", { name: "閉じる" })).toHaveFocus();
        expect(screen.getByRole("heading", { level: 2, name: "絞り込み" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "適用する" })).toBeInTheDocument();
    });

    it("閉じていれば何も描画しない", () => {
        render(<Harness />);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("placement=left で左から開き、閉じるボタンが左寄せになる", async () => {
        await openDrawer({ placement: "left" });
        const dialog = screen.getByRole("dialog");
        expect(dialog.parentElement).toHaveClass("justify-start");
        expect(dialog).toHaveAttribute("data-placement", "left");
        expect(screen.getByRole("button", { name: "閉じる" }).parentElement).toHaveClass("flex-row-reverse");
    });

    it("size=lg で md 以上の幅が広がる", async () => {
        await openDrawer({ size: "lg" });
        expect(screen.getByRole("dialog")).toHaveClass("w-drawer", "md:w-lg");
    });

    it("title がないときは aria-label で名前を付ける", async () => {
        await openDrawer({ title: undefined, "aria-label": "メニュー" });
        expect(screen.getByRole("dialog", { name: "メニュー" })).toBeInTheDocument();
        expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });

    it("Tab はドロワーの中で巡回する（本文とフッターを含む）", async () => {
        const { user } = await openDrawer();
        await user.tab();
        expect(screen.getByLabelText("キーワード")).toHaveFocus();
        await user.tab();
        expect(screen.getByRole("button", { name: "適用する" })).toHaveFocus();
        await user.tab();
        expect(screen.getByRole("button", { name: "閉じる" })).toHaveFocus();
        await user.tab({ shift: true });
        expect(screen.getByRole("button", { name: "適用する" })).toHaveFocus();
    });

    it("Esc で閉じ、開く前の要素へフォーカスを戻す", async () => {
        const { user } = await openDrawer();
        await user.keyboard("{Escape}");
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "開く" })).toHaveFocus();
    });

    it("閉じるボタンと暗幕のクリックで閉じる（dismissOnBackdrop=false なら暗幕では閉じない）", async () => {
        const { user } = await openDrawer();
        await user.click(screen.getByRole("button", { name: "閉じる" }));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "開く" }));
        await user.click(screen.getByRole("dialog").parentElement!);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("dismissOnBackdrop=false なら暗幕のクリックでは閉じない", async () => {
        const { user } = await openDrawer({ dismissOnBackdrop: false });
        await user.click(screen.getByRole("dialog").parentElement!);
        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("開いている間は背景に inert が付き、閉じると外れる", async () => {
        const { user, container } = await openDrawer();
        expect(container).toHaveAttribute("inert");
        await user.keyboard("{Escape}");
        expect(container).not.toHaveAttribute("inert");
    });

    it("アクセシビリティ違反がない", async () => {
        await openDrawer();
        await expectNoA11yViolations(screen.getByRole("dialog"));
    });
});
