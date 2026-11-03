import { screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { renderApp } from "@/test/renderApp";
import { APPLICATIONS } from "@/mocks/applications";

type User = ReturnType<typeof renderApp>["user"];

async function fillValidForm(user: User) {
    await user.type(screen.getByLabelText(/^件名/), "商店街活性化事業補助金の申請");
    await user.click(screen.getByRole("radio", { name: "補助金" }));
    await user.type(screen.getByLabelText(/^申請額/), "１，２００，０００");
    await user.type(screen.getByLabelText(/^氏名/), "山田 太郎");
    await user.type(screen.getByLabelText(/^メールアドレス/), "yamada@example.jp");
    // 日付は blur 時に確定する
    await user.type(screen.getByLabelText(/^希望日/), "2099/12/01");
    await user.tab();
    await user.upload(screen.getByLabelText(/^添付ファイル/), new File(["%PDF"], "申請書.pdf", { type: "application/pdf" }));
    await user.click(screen.getByRole("checkbox", { name: "記載内容に誤りがないことを確認しました" }));
}

describe("ApplicationFormPage（新規）", () => {
    it("見出し・パンくず・ステップ・入力項目を表示する", async () => {
        const { container } = renderApp("/applications/new");
        expect(screen.getByRole("heading", { level: 1, name: "新規申請" })).toBeInTheDocument();
        const breadcrumb = screen.getByRole("navigation", { name: "パンくずリスト" });
        expect(within(breadcrumb).getByRole("link", { name: "申請一覧" })).toHaveAttribute("href", "/applications");
        const steps = screen.getByRole("navigation", { name: "手続きの流れ" });
        expect(within(steps).getAllByRole("listitem")).toHaveLength(3);
        expect(screen.getByLabelText(/^件名/)).toHaveAccessibleDescription(/40 文字以内/);
        expect(screen.getByLabelText(/^申請額/)).toHaveAttribute("inputmode", "numeric");
        expect(screen.getByLabelText(/^メールアドレス/)).toHaveAttribute("autocomplete", "email");
        expect(screen.getByLabelText(/^電話番号/)).toHaveAttribute("inputmode", "tel");
        expect(screen.getByRole("switch", { name: "優先対応" })).toHaveAttribute("aria-checked", "false");
        // 送信ボタンは無効化しない
        expect(screen.getByRole("button", { name: "確認へ進む" })).toBeEnabled();
        // 入力中はエラーを出さない
        expect(screen.queryByText(/件の誤りがあります/)).not.toBeInTheDocument();
        await expectNoA11yViolations(container);
    });

    it("空のまま送信するとエラーのまとめと各項目のエラーを表示し、まとめの見出しへフォーカスを移す", async () => {
        const { user, container } = renderApp("/applications/new");
        await user.click(screen.getByRole("button", { name: "確認へ進む" }));

        const heading = screen.getByRole("heading", { level: 2, name: "入力内容に 6 件の誤りがあります" });
        expect(heading).toBeInTheDocument();
        expect(document.activeElement).toBe(screen.getByText("入力内容に 6 件の誤りがあります"));

        const title = screen.getByLabelText(/^件名/);
        expect(title).toHaveAttribute("aria-invalid", "true");
        expect(title).toHaveAccessibleDescription(/＊件名を入力してください/);
        expect(screen.getByLabelText(/^メールアドレス/)).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByLabelText(/^希望日/)).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByText("＊種別を選択してください")).toBeInTheDocument();
        expect(screen.getByText(/^＊内容を確認のうえ/)).toBeInTheDocument();
        // 任意項目にはエラーを出さない
        expect(screen.getByLabelText(/^所属/)).not.toHaveAttribute("aria-invalid");
        await expectNoA11yViolations(container);
    });

    it("エラー一覧のリンクで該当項目へフォーカスを移す", async () => {
        const { user } = renderApp("/applications/new");
        await user.click(screen.getByRole("button", { name: "確認へ進む" }));

        await user.click(screen.getByRole("link", { name: /^メールアドレス: / }));
        expect(document.activeElement).toBe(screen.getByLabelText(/^メールアドレス/));

        await user.click(screen.getByRole("link", { name: /^種別: / }));
        expect(document.activeElement).toBe(screen.getByRole("radio", { name: "補助金" }));

        await user.click(screen.getByRole("link", { name: /^確認事項: / }));
        expect(document.activeElement).toBe(screen.getByRole("checkbox", { name: "記載内容に誤りがないことを確認しました" }));
    });

    it("修正して再送信するとエラーが消え、入力値は保持される", async () => {
        const { user } = renderApp("/applications/new");
        await user.type(screen.getByLabelText(/^件名/), "道路占用許可申請");
        await user.type(screen.getByLabelText(/^メールアドレス/), "yamada");
        await user.click(screen.getByRole("button", { name: "確認へ進む" }));
        expect(screen.getByLabelText(/^件名/)).toHaveValue("道路占用許可申請");
        expect(screen.getByLabelText(/^件名/)).not.toHaveAttribute("aria-invalid");
        expect(screen.getByLabelText(/^メールアドレス/)).toHaveAccessibleDescription(/@ とドメインを含めて/);

        // 補助金を選ぶと申請額と添付ファイルも必須になる
        await user.click(screen.getByRole("radio", { name: "補助金" }));
        await user.click(screen.getByRole("button", { name: "確認へ進む" }));
        expect(screen.getByText(/＊補助金・許認可の申請では申請額/)).toBeInTheDocument();
        expect(screen.getByText(/＊補助金の申請では申請書/)).toBeInTheDocument();
        expect(screen.queryByText("＊種別を選択してください")).not.toBeInTheDocument();
    });

    it("正しく入力すると確認画面 → 申請 → 完了画面に進む", async () => {
        const { user, container } = renderApp("/applications/new");
        await fillValidForm(user);
        await user.click(screen.getByRole("button", { name: "確認へ進む" }));

        const confirmHeading = screen.getByRole("heading", { level: 2, name: "入力内容の確認" });
        expect(document.activeElement).toBe(confirmHeading);
        expect(screen.getByText("1,200,000 円")).toBeInTheDocument();
        expect(screen.getByText(/^2099年12月1日（.）$/)).toBeInTheDocument();
        expect(screen.getByText("申請書.pdf")).toBeInTheDocument();
        expect(screen.getByRole("navigation", { name: "手続きの流れ" }).querySelector('[aria-current="step"]')).toHaveTextContent("確認");
        await expectNoA11yViolations(container);

        // 修正する → 入力値を保ったまま入力画面へ戻る
        await user.click(screen.getByRole("button", { name: "修正する" }));
        expect(document.activeElement).toBe(screen.getByRole("heading", { level: 2, name: "申請内容の入力" }));
        expect(screen.getByLabelText(/^件名/)).toHaveValue("商店街活性化事業補助金の申請");
        await user.click(screen.getByRole("button", { name: "確認へ進む" }));

        await user.click(screen.getByRole("button", { name: "申請する" }));
        expect(document.activeElement).toBe(screen.getByText("申請を受け付けました"));
        expect(screen.getByText(/^R08-\d{6}$/)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "申請一覧へ" })).toHaveAttribute("href", "/applications");
        await expectNoA11yViolations(container);

        // 続けて申請する → 空の入力画面に戻る
        await user.click(screen.getByRole("button", { name: "続けて申請する" }));
        expect(screen.getByLabelText(/^件名/)).toHaveValue("");
        expect(document.activeElement).toBe(screen.getByRole("heading", { level: 2, name: "申請内容の入力" }));
    });

    it("下書き保存でトーストを表示する", async () => {
        const { user } = renderApp("/applications/new");
        await user.click(screen.getByRole("button", { name: "下書き保存" }));
        expect(await screen.findByText("下書きを保存しました")).toBeInTheDocument();
    });

    it("入力があるときのキャンセルは破棄の確認を挟む", async () => {
        const { user } = renderApp("/applications/new");
        await user.type(screen.getByLabelText(/^件名/), "公園使用許可申請");
        await user.click(screen.getByRole("button", { name: "キャンセル" }));

        const dialog = await screen.findByRole("dialog", { name: "入力内容を破棄しますか" });
        await user.click(within(dialog).getByRole("button", { name: "入力を続ける" }));
        expect(screen.getByLabelText(/^件名/)).toHaveValue("公園使用許可申請");

        await user.click(screen.getByRole("button", { name: "キャンセル" }));
        await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "破棄する" }));
        await waitFor(() => expect(screen.queryByRole("heading", { level: 1, name: "新規申請" })).not.toBeInTheDocument());
    });

    it("未入力のキャンセルは確認なしで一覧へ戻る", async () => {
        const { user } = renderApp("/applications/new");
        await user.click(screen.getByRole("button", { name: "キャンセル" }));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.queryByRole("heading", { level: 1, name: "新規申請" })).not.toBeInTheDocument();
    });
});

describe("ApplicationFormPage（編集）", () => {
    const app = APPLICATIONS.find((a) => a.category === "subsidy" && a.organization !== "個人")!;

    it("既存の値を初期値にする", async () => {
        const { container } = renderApp(`/applications/${app.id}/edit`);
        expect(screen.getByRole("heading", { level: 1, name: "申請を編集" })).toBeInTheDocument();
        expect(screen.getByText(`${app.number}「${app.title}」`)).toBeInTheDocument();
        const breadcrumb = screen.getByRole("navigation", { name: "パンくずリスト" });
        expect(within(breadcrumb).getByRole("link", { name: app.number })).toHaveAttribute("href", `/applications/${app.id}`);
        expect(screen.getByLabelText(/^件名/)).toHaveValue(app.title);
        expect(screen.getByRole("radio", { name: "補助金" })).toBeChecked();
        expect(screen.getByLabelText(/^申請額/)).toHaveValue(String(app.amount));
        expect(screen.getByLabelText(/^氏名/)).toHaveValue(app.applicant);
        expect(screen.getByLabelText(/^所属/)).toHaveValue(app.organization);
        expect(screen.getByLabelText(/^担当者/)).toHaveValue(app.assignee);
        expect(within(screen.getByRole("navigation", { name: "手続きの流れ" })).getAllByRole("listitem")).toHaveLength(2);
        await expectNoA11yViolations(container);
    });

    it("確認後に「更新する」で詳細画面へ戻ってトーストを出す", async () => {
        const { user } = renderApp(`/applications/${app.id}/edit`);
        await user.click(screen.getByRole("checkbox", { name: "記載内容に誤りがないことを確認しました" }));
        await user.click(screen.getByRole("button", { name: "確認へ進む" }));
        await user.click(screen.getByRole("button", { name: "更新する" }));
        expect(await screen.findByText("申請内容を更新しました")).toBeInTheDocument();
        expect(screen.queryByRole("heading", { level: 1, name: "申請を編集" })).not.toBeInTheDocument();
    });

    it("存在しない id は 404 を表示する", async () => {
        const { container } = renderApp("/applications/app-999/edit");
        expect(screen.getByRole("heading", { level: 1, name: "申請が見つかりません" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "申請一覧へ戻る" })).toHaveAttribute("href", "/applications");
        await expectNoA11yViolations(container);
    });
});
