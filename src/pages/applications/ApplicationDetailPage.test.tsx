import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { APPLICATIONS } from "@/mocks/applications";
import { expectNoA11yViolations } from "@/test/axe";
import { renderApp } from "@/test/renderApp";

const reviewing = APPLICATIONS.find((a) => a.status === "reviewing" && a.attachments.length > 1)!;
const returned = APPLICATIONS.find((a) => a.status === "returned")!;

describe("ApplicationDetailPage", () => {
    it("件名・パンくず・状態・申請内容を表示する", () => {
        renderApp(`/applications/${reviewing.id}`);
        expect(screen.getByRole("heading", { level: 1, name: reviewing.title })).toBeInTheDocument();
        const breadcrumb = screen.getByRole("navigation", { name: "パンくずリスト" });
        expect(within(breadcrumb).getByRole("link", { name: "申請一覧" })).toHaveAttribute("href", "/applications");
        expect(within(breadcrumb).getByText(reviewing.number)).toHaveAttribute("aria-current", "page");
        expect(screen.getAllByText("審査中").length).toBeGreaterThan(0);
        expect(screen.getByRole("link", { name: "編集" })).toHaveAttribute("href", `/applications/${reviewing.id}/edit`);

        const panel = screen.getByRole("tabpanel", { name: "概要" });
        expect(within(panel).getByText("申請者")).toBeInTheDocument();
        expect(within(panel).getByRole("heading", { name: "担当者" })).toBeInTheDocument();
        expect(within(panel).getByRole("heading", { name: "関連する申請" })).toBeInTheDocument();
    });

    it("矢印キーでタブを切り替えられる", async () => {
        const { user } = renderApp(`/applications/${reviewing.id}`);
        await user.click(screen.getByRole("tab", { name: "概要" }));
        await user.keyboard("{ArrowRight}");
        const attachmentsTab = screen.getByRole("tab", { name: /^添付ファイル/ });
        expect(attachmentsTab).toHaveAttribute("aria-selected", "true");
        expect(attachmentsTab).toHaveFocus();
        const panel = screen.getByRole("tabpanel", { name: /^添付ファイル/ });
        expect(within(panel).getByRole("button", { name: `${reviewing.attachments[0].name} をダウンロード` })).toBeInTheDocument();

        await user.keyboard("{ArrowRight}");
        expect(screen.getByRole("tab", { name: "履歴" })).toHaveAttribute("aria-selected", "true");
        expect(within(screen.getByRole("tabpanel", { name: "履歴" })).getByRole("heading", { name: "処理の経過" })).toBeInTheDocument();
    });

    it("承認すると確認のあとに状態が変わり、成功のバナーを表示する", async () => {
        const { user } = renderApp(`/applications/${reviewing.id}`);
        await user.click(screen.getByRole("button", { name: "承認する" }));
        const dialog = screen.getByRole("dialog", { name: "この申請を承認しますか" });
        await user.click(within(dialog).getByRole("button", { name: "承認する" }));

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "申請を承認しました" })).toBeInTheDocument();
        expect(screen.getByText(`${reviewing.number} を承認しました`)).toBeInTheDocument();
        // 決定済みになったので承認ボタンは出さない
        expect(screen.queryByRole("button", { name: "承認する" })).not.toBeInTheDocument();
    });

    it("差戻しダイアログ: 開くと見出しにフォーカスし、未入力で送るとエラー、Esc で閉じてトリガーへ戻る", async () => {
        const { user } = renderApp(`/applications/${reviewing.id}`);
        const trigger = screen.getByRole("button", { name: "その他の操作" });
        await user.click(trigger);
        await user.click(screen.getByRole("menuitem", { name: "差戻し" }));

        const dialog = screen.getByRole("dialog", { name: "申請を差し戻す" });
        expect(within(dialog).getByRole("heading", { name: "申請を差し戻す" })).toHaveFocus();

        await user.click(within(dialog).getByRole("button", { name: "差し戻す" }));
        expect(within(dialog).getByText("＊差戻しの理由を入力してください")).toBeInTheDocument();
        const textarea = within(dialog).getByRole("textbox", { name: /差戻しの理由/ });
        expect(textarea).toHaveAttribute("aria-invalid", "true");
        expect(textarea).toHaveFocus();

        await user.keyboard("{Escape}");
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(trigger).toHaveFocus();
    });

    it("理由を入力して差し戻すと、差戻しのバナーに理由を表示する", async () => {
        const { user } = renderApp(`/applications/${reviewing.id}`);
        await user.click(screen.getByRole("button", { name: "その他の操作" }));
        await user.click(screen.getByRole("menuitem", { name: "差戻し" }));
        const dialog = screen.getByRole("dialog", { name: "申請を差し戻す" });
        await user.type(within(dialog).getByRole("textbox", { name: /差戻しの理由/ }), "添付書類の押印が不足しています。");
        await user.click(within(dialog).getByRole("button", { name: "差し戻す" }));

        expect(screen.getByRole("heading", { name: "この申請は差し戻されています" })).toBeInTheDocument();
        expect(screen.getByText("添付書類の押印が不足しています。")).toBeInTheDocument();
    });

    it("差戻し中の申請は警告のバナーを表示する", () => {
        renderApp(`/applications/${returned.id}`);
        expect(screen.getByRole("heading", { name: "この申請は差し戻されています" })).toBeInTheDocument();
    });

    it("存在しない id では 404 を表示する", async () => {
        const { user } = renderApp("/applications/app-999");
        expect(screen.getByText("404")).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 1, name: "申請が見つかりません" })).toBeInTheDocument();
        await user.click(screen.getByRole("link", { name: "申請一覧へ戻る" }));
        expect(screen.getByRole("heading", { level: 1, name: "申請一覧" })).toBeInTheDocument();
    });

    it("アクセシビリティ違反がない", async () => {
        const { container, user } = renderApp(`/applications/${returned.id}`);
        await expectNoA11yViolations(container);
        await user.click(screen.getByRole("tab", { name: "履歴" }));
        await expectNoA11yViolations(container);
        await user.click(screen.getByRole("tab", { name: /^添付ファイル/ }));
        await expectNoA11yViolations(container);
    });
});
