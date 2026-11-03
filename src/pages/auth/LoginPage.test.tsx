import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { renderApp } from "@/test/renderApp";

describe("LoginPage", () => {
    it("シェルなしで、自前のmainとh1を持つ", () => {
        renderApp("/login");
        expect(screen.getByRole("main")).toHaveAttribute("id", "main");
        expect(screen.getByRole("heading", { level: 1, name: "ログイン" })).toBeInTheDocument();
        expect(screen.queryByRole("banner")).toBeNull();
        expect(screen.getByRole("link", { name: "パスワードを忘れた場合" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "利用規約" })).toBeInTheDocument();
    });

    it("空欄で送信すると各項目にエラーを出し、最初の項目にフォーカスを移す", async () => {
        const { user } = renderApp("/login");
        await user.click(screen.getByRole("button", { name: "ログイン" }));
        expect(screen.getByText("＊メールアドレスを入力してください")).toBeInTheDocument();
        expect(screen.getByText("＊パスワードを入力してください")).toBeInTheDocument();
        expect(screen.getByRole("textbox", { name: "メールアドレス" })).toHaveFocus();
    });

    it("認証に失敗するとバナーを出してフォーカスを移す", async () => {
        const { user } = renderApp("/login");
        await user.type(screen.getByRole("textbox", { name: "メールアドレス" }), "fail@example.go.jp");
        await user.type(screen.getByLabelText("パスワード"), "password");
        await user.click(screen.getByRole("button", { name: "ログイン" }));
        const title = await screen.findByRole("heading", { name: "メールアドレスかパスワードが違います" });
        expect(title).toHaveFocus();
        expect(screen.getByRole("heading", { level: 1, name: "ログイン" })).toBeInTheDocument();
    });

    it("成功するとホームへ移り、トーストを出す", async () => {
        const { user } = renderApp("/login");
        await user.type(screen.getByRole("textbox", { name: "メールアドレス" }), "sato.hanako@example.go.jp");
        await user.type(screen.getByLabelText("パスワード"), "password");
        await user.click(screen.getByRole("button", { name: "ログイン" }));
        expect(await screen.findByText("ログインしました", {}, { timeout: 2000 })).toBeInTheDocument();
        // 画面遷移はトランジションとして描画されるため、トーストより後になることがある。
        await waitFor(() => expect(screen.queryByRole("heading", { level: 1, name: "ログイン" })).toBeNull());
        expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    it("「パスワードを表示」でパスワードの表示を切り替える", async () => {
        const { user } = renderApp("/login");
        const password = screen.getByLabelText("パスワード");
        expect(password).toHaveAttribute("type", "password");
        await user.click(screen.getByRole("checkbox", { name: "パスワードを表示" }));
        expect(password).toHaveAttribute("type", "text");
        await user.click(screen.getByRole("checkbox", { name: "パスワードを表示" }));
        expect(password).toHaveAttribute("type", "password");
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = renderApp("/login");
        await expectNoA11yViolations(container);
    });
});
