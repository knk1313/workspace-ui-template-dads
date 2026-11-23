import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { LoadError } from "./LoadError";

describe("LoadError", () => {
    it("何を読み込めなかったかと、エラーの文を出す", () => {
        render(<LoadError subject="申請の一覧" error={new Error("通信に失敗しました。")} onRetry={async () => {}} />);
        expect(screen.getByRole("heading", { name: "申請の一覧を読み込めませんでした" })).toBeInTheDocument();
        expect(screen.getByText("通信に失敗しました。")).toBeInTheDocument();
    });

    it("前の内容を表示し続けているときは、古い内容であることを知らせる", () => {
        render(<LoadError subject="申請" error={new Error("x")} onRetry={async () => {}} stale />);
        expect(screen.getByText(/前に読み込んだ内容を表示しています/)).toBeInTheDocument();
    });

    it("「再読み込み」で onRetry を呼び、終わるまで処理中にする", async () => {
        const user = userEvent.setup();
        let finish: () => void = () => {};
        const onRetry = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
        render(<LoadError error={new Error("x")} onRetry={onRetry} />);
        await user.click(screen.getByRole("button", { name: "再読み込み" }));
        expect(onRetry).toHaveBeenCalledTimes(1);
        expect(screen.getByRole("button", { name: /再読み込み/ })).toHaveAttribute("aria-busy", "true");
        finish();
        await vi.waitFor(() => expect(screen.getByRole("button", { name: "再読み込み" })).not.toHaveAttribute("aria-busy", "true"));
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(<LoadError subject="申請" error={new Error("通信に失敗しました。")} onRetry={async () => {}} />);
        await expectNoA11yViolations(container);
    });
});
