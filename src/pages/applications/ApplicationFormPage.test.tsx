import { act, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { renderApp } from "@/test/renderApp";
import { getApplication } from "@/api/applications";
import { setMockOptions } from "@/api/mock";
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
    await user.click(screen.getByRole("checkbox", { name: "記載内容に誤りがないことを確かめた" }));
}

describe("ApplicationFormPage（新規）", () => {
    it("見出し・パンくず・ステップ・入力項目を表示する", async () => {
        const { container } = renderApp("/applications/new");
        expect(screen.getByRole("heading", { level: 1, name: "新規申請" })).toBeInTheDocument();
        const breadcrumb = screen.getByRole("navigation", { name: "パンくずリスト" });
        expect(within(breadcrumb).getByRole("link", { name: "申請一覧" })).toHaveAttribute("href", "/applications");
        const steps = screen.getByRole("navigation", { name: "手続きの流れ" });
        expect(within(steps).getAllByRole("listitem")).toHaveLength(3);
        expect(screen.getByLabelText(/^件名/)).toHaveAccessibleDescription(/40文字以内/);
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

        const heading = screen.getByRole("heading", { level: 2, name: "入力内容に6件の誤りがあります" });
        expect(heading).toBeInTheDocument();
        expect(document.activeElement).toBe(screen.getByText("入力内容に6件の誤りがあります"));

        const title = screen.getByLabelText(/^件名/);
        expect(title).toHaveAttribute("aria-invalid", "true");
        expect(title).toHaveAccessibleDescription(/＊件名を入力してください/);
        expect(screen.getByLabelText(/^メールアドレス/)).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByLabelText(/^希望日/)).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByText("＊種別を選んでください")).toBeInTheDocument();
        expect(screen.getByText(/^＊記載内容を確かめてから/)).toBeInTheDocument();
        // 任意項目にはエラーを出さない
        expect(screen.getByLabelText(/^所属/)).not.toHaveAttribute("aria-invalid");
        await expectNoA11yViolations(container);
    });

    it("エラー一覧のリンクで該当項目へフォーカスを移す", async () => {
        const { user } = renderApp("/applications/new");
        await user.click(screen.getByRole("button", { name: "確認へ進む" }));

        await user.click(screen.getByRole("link", { name: /^メールアドレス：/ }));
        expect(document.activeElement).toBe(screen.getByLabelText(/^メールアドレス/));

        await user.click(screen.getByRole("link", { name: /^種別：/ }));
        expect(document.activeElement).toBe(screen.getByRole("radio", { name: "補助金" }));

        await user.click(screen.getByRole("link", { name: /^確認事項：/ }));
        expect(document.activeElement).toBe(screen.getByRole("checkbox", { name: "記載内容に誤りがないことを確かめた" }));
    });

    it("修正して再送信するとエラーが消え、入力値は保持される", async () => {
        const { user } = renderApp("/applications/new");
        await user.type(screen.getByLabelText(/^件名/), "道路占用許可申請");
        await user.type(screen.getByLabelText(/^メールアドレス/), "yamada");
        await user.click(screen.getByRole("button", { name: "確認へ進む" }));
        expect(screen.getByLabelText(/^件名/)).toHaveValue("道路占用許可申請");
        expect(screen.getByLabelText(/^件名/)).not.toHaveAttribute("aria-invalid");
        expect(screen.getByLabelText(/^メールアドレス/)).toHaveAccessibleDescription(/@とドメインを含めて/);

        // 補助金を選ぶと申請額と添付ファイルも必須になる
        await user.click(screen.getByRole("radio", { name: "補助金" }));
        await user.click(screen.getByRole("button", { name: "確認へ進む" }));
        expect(screen.getByText(/＊補助金・許認可の申請では申請額/)).toBeInTheDocument();
        expect(screen.getByText(/＊補助金の申請では申請書/)).toBeInTheDocument();
        expect(screen.queryByText("＊種別を選んでください")).not.toBeInTheDocument();
    });

    it("正しく入力すると確認画面 → 申請 → 完了画面に進む", async () => {
        const { user, container } = renderApp("/applications/new");
        await fillValidForm(user);
        await user.click(screen.getByRole("button", { name: "確認へ進む" }));

        const confirmHeading = screen.getByRole("heading", { level: 2, name: "入力内容の確認" });
        expect(document.activeElement).toBe(confirmHeading);
        expect(screen.getByText("1,200,000円")).toBeInTheDocument();
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
        await waitFor(() => expect(document.activeElement).toBe(screen.getByText("申請の受付完了")));
        expect(screen.getByText(/^R08-\d{6}$/)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "申請一覧へ" })).toHaveAttribute("href", "/applications");
        expect(screen.getByRole("link", { name: "この申請を開く" })).toHaveAttribute("href", expect.stringMatching(/^\/applications\/app-new-\d+$/));
        await expectNoA11yViolations(container);

        // 続けて申請する → 空の入力画面に戻る
        await user.click(screen.getByRole("button", { name: "続けて申請する" }));
        expect(screen.getByLabelText(/^件名/)).toHaveValue("");
        expect(document.activeElement).toBe(screen.getByRole("heading", { level: 2, name: "申請内容の入力" }));
    });

    it("下書き保存でトーストを表示し、保存した直後に離れても破棄の確認を出さない", async () => {
        const { user } = renderApp("/applications/new");
        await user.type(screen.getByLabelText(/^件名/), "公園使用許可申請");
        await user.click(screen.getByRole("button", { name: "下書き保存" }));
        expect(await screen.findByText("下書きを保存しました")).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "キャンセル" }));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        await waitFor(() => expect(screen.queryByRole("heading", { level: 1, name: "新規申請" })).not.toBeInTheDocument());
    });

    it("確認の段階でブラウザーの「戻る」を押すと、確認を出さずに入力の段階へ戻る", async () => {
        const { user, router } = renderApp("/applications/new");
        await fillValidForm(user);
        await user.click(screen.getByRole("button", { name: "確認へ進む" }));
        expect(screen.getByRole("heading", { level: 2, name: "入力内容の確認" })).toBeInTheDocument();
        expect(router.state.location.search).toBe("?step=confirm");
        await act(() => router.navigate(-1));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 2, name: "申請内容の入力" })).toBeInTheDocument();
        expect(screen.getByLabelText(/^件名/)).toHaveValue("商店街活性化事業補助金の申請");
    });

    it("?step=confirmを直接開いたときは、入力の段階から始める", () => {
        renderApp("/applications/new?step=confirm");
        expect(screen.getByRole("heading", { level: 2, name: "申請内容の入力" })).toBeInTheDocument();
    });

    it("入力があるときのキャンセルは破棄の確認を挟む", async () => {
        const { user } = renderApp("/applications/new");
        await user.type(screen.getByLabelText(/^件名/), "公園使用許可申請");
        await user.click(screen.getByRole("button", { name: "キャンセル" }));

        const dialog = await screen.findByRole("dialog", { name: "入力内容を破棄して移動する" });
        await user.click(within(dialog).getByRole("button", { name: "入力を続ける" }));
        expect(screen.getByLabelText(/^件名/)).toHaveValue("公園使用許可申請");

        await user.click(screen.getByRole("button", { name: "キャンセル" }));
        await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "破棄して移動" }));
        await waitFor(() => expect(screen.queryByRole("heading", { level: 1, name: "新規申請" })).not.toBeInTheDocument());
    });

    it("入力があるときは、リンクで離れるときも確認を挟む", async () => {
        const { user, router } = renderApp("/applications/new");
        await user.type(screen.getByLabelText(/^件名/), "公園使用許可申請");
        await user.click(within(screen.getByRole("navigation", { name: "パンくずリスト" })).getByRole("link", { name: "ホーム" }));
        const dialog = await screen.findByRole("dialog", { name: "入力内容を破棄して移動する" });
        await user.click(within(dialog).getByRole("button", { name: "破棄して移動" }));
        await waitFor(() => expect(router.state.location.pathname).toBe("/"));
    });

    it("送信に失敗すると確認画面に残り、エラーを表示する（入力内容は失わない）", async () => {
        const { user } = renderApp("/applications/new");
        await fillValidForm(user);
        await user.click(screen.getByRole("button", { name: "確認へ進む" }));
        setMockOptions({ fail: true, slow: false });
        await user.click(await screen.findByRole("button", { name: "申請する" }));
        expect(await screen.findByRole("heading", { name: "申請できませんでした" })).toBeInTheDocument();
        // 画面の下のボタンを押したので、上に出たエラーのバナーへフォーカスを移す
        await waitFor(() => expect(screen.getByRole("heading", { name: "申請できませんでした" })).toHaveFocus());
        expect(screen.getByRole("heading", { name: "入力内容の確認" })).toBeInTheDocument();

        setMockOptions({ fail: false, slow: false });
        await user.click(screen.getByRole("button", { name: "申請する" }));
        expect(await screen.findByText("申請の受付完了")).toBeInTheDocument();
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
        expect(await screen.findByRole("heading", { level: 1, name: "申請を編集" })).toBeInTheDocument();
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
        await user.click(await screen.findByRole("checkbox", { name: "記載内容に誤りがないことを確かめた" }));
        await user.click(screen.getByRole("button", { name: "確認へ進む" }));
        await user.click(screen.getByRole("button", { name: "更新する" }));
        expect(await screen.findByText("申請内容を更新しました")).toBeInTheDocument();
        // 画面の移動はトーストのあとに終わる
        await waitFor(() => expect(screen.queryByRole("heading", { level: 1, name: "申請を編集" })).not.toBeInTheDocument());
    });

    it("フォームで扱わない形式の添付ファイルは、更新しても消えない", async () => {
        const withXlsx = APPLICATIONS.find((a) => a.attachments.some((f) => f.name.endsWith(".xlsx")))!;
        const { user } = renderApp(`/applications/${withXlsx.id}/edit`);
        expect(await screen.findByText(/ここでは変更できない形式の添付ファイルがあります/)).toBeInTheDocument();
        await user.click(screen.getByRole("checkbox", { name: "記載内容に誤りがないことを確かめた" }));
        await user.click(screen.getByRole("button", { name: "確認へ進む" }));
        expect(screen.getByText(/添付資料\.xlsx/)).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "更新する" }));
        await waitFor(() => expect(screen.queryByRole("heading", { level: 1, name: "申請を編集" })).not.toBeInTheDocument());
        const { application } = (await getApplication(withXlsx.id))!;
        expect(application.attachments.map((f) => f.name)).toEqual(["申請書.pdf", "添付資料.xlsx"]);
    });

    it("更新に失敗したときは、「更新する」を押し直すよう案内する", async () => {
        const { user } = renderApp(`/applications/${app.id}/edit`);
        await user.click(await screen.findByRole("checkbox", { name: "記載内容に誤りがないことを確かめた" }));
        await user.click(screen.getByRole("button", { name: "確認へ進む" }));
        setMockOptions({ fail: true, slow: false });
        await user.click(screen.getByRole("button", { name: "更新する" }));
        expect(await screen.findByRole("heading", { name: "更新できませんでした" })).toBeInTheDocument();
        expect(screen.getByText("編集した内容は残っています。時間をおいて、もう一度「更新する」を押してください。")).toBeInTheDocument();
        setMockOptions({ fail: false, slow: false });
    });

    it("一覧の絞り込みの条件を、編集から詳細へ戻ったあとも引き継ぐ", async () => {
        const { user, router } = renderApp("/");
        await act(() => router.navigate(`/applications/${app.id}/edit`, { state: { listSearch: "?status=reviewing" } }));
        const breadcrumb = await screen.findByRole("navigation", { name: "パンくずリスト" });
        expect(within(breadcrumb).getByRole("link", { name: "申請一覧" })).toHaveAttribute("href", "/applications?status=reviewing");
        await user.click(screen.getByRole("checkbox", { name: "記載内容に誤りがないことを確かめた" }));
        await user.click(screen.getByRole("button", { name: "確認へ進む" }));
        await user.click(screen.getByRole("button", { name: "更新する" }));
        await waitFor(() => expect(router.state.location.pathname).toBe(`/applications/${app.id}`));
        // 詳細画面が描かれる（編集のフォームが片付く）まで待つ
        await screen.findByRole("heading", { level: 1, name: app.title });
        // フォームを片付けたときの effect（離脱の確認の登録を外す）を流し切ってから、「戻る」を押す
        await act(async () => {});
        const detailBreadcrumb = screen.getByRole("navigation", { name: "パンくずリスト" });
        expect(within(detailBreadcrumb).getByRole("link", { name: "申請一覧" })).toHaveAttribute("href", "/applications?status=reviewing");
        // 編集の画面は履歴から外したので、「戻る」で入り直さない
        await act(() => router.navigate(-1));
        expect(router.state.location.pathname).toBe("/");
    });

    it("存在しないidは404を表示する", async () => {
        const { container } = renderApp("/applications/app-999/edit");
        expect(await screen.findByRole("heading", { level: 1, name: "申請が見つかりません" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "申請一覧へ戻る" })).toHaveAttribute("href", "/applications");
        await expectNoA11yViolations(container);
    });
});
