import { act, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SESSION_STORAGE_KEY, login } from "@/api/auth";
import { setMockOptions } from "@/api/mock";
import { getQueryData } from "@/api/query";
import { expectNoA11yViolations } from "@/test/axe";
import { renderApp } from "@/test/renderApp";

type App = ReturnType<typeof renderApp>;

async function signInThroughForm(user: App["user"]) {
    await user.type(await screen.findByRole("textbox", { name: "メールアドレス" }), "sato.hanako@example.jp");
    await user.type(screen.getByLabelText("パスワード"), "password");
    await user.click(screen.getByRole("button", { name: "ログイン" }));
}

async function clickLogout(user: App["user"]) {
    await user.click(screen.getByRole("button", { name: "佐藤 花子" }));
    await user.click(screen.getByRole("menuitem", { name: "ログアウト" }));
}

describe("ログインの確認", () => {
    it("ログインしていなければログイン画面へ移し、ログインすると元の画面（検索条件も）へ戻す", async () => {
        const { user, router } = renderApp("/settings?tab=notifications", { loggedIn: false });
        expect(screen.getByText("ログインの状態を読み込んでいます")).toBeInTheDocument();
        await waitFor(() => expect(router.state.location.pathname).toBe("/login"));
        await signInThroughForm(user);
        await waitFor(() => expect(router.state.location.pathname + router.state.location.search).toBe("/settings?tab=notifications"));
        expect(await screen.findByRole("button", { name: "佐藤 花子" })).toBeInTheDocument();
    });

    it("確かめるまで、シェルも「アカウント」の仮の名前も出さない", async () => {
        sessionStorage.setItem(SESSION_STORAGE_KEY, "1");
        renderApp("/settings", { loggedIn: false });
        expect(screen.queryByRole("banner")).not.toBeInTheDocument();
        expect(await screen.findByRole("button", { name: "佐藤 花子" })).toBeInTheDocument();
    });

    it("404と500は、ログインしていなくてもシェルなしで出す", async () => {
        const { router, container } = renderApp("/password-reset", { loggedIn: false });
        expect(await screen.findByRole("heading", { level: 1, name: "ページが見つかりません" })).toBeInTheDocument();
        expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
        await expectNoA11yViolations(container);
        await act(() => router.navigate("/error/500"));
        expect(await screen.findByRole("heading", { level: 1, name: "ページを表示できません" })).toBeInTheDocument();
    });

    it("「通信を失敗させる」でも、ログインの確認は失敗しない（設定を戻せなくならないように）", async () => {
        sessionStorage.setItem(SESSION_STORAGE_KEY, "1");
        setMockOptions({ fail: true, slow: false });
        renderApp("/settings?tab=display", { loggedIn: false });
        expect(await screen.findByRole("switch", { name: "通信を失敗させる" })).toBeInTheDocument();
    });

    it("「ログイン状態を保持する」を選んだときだけ、タブを閉じても残る場所に保存する", async () => {
        await login({ email: "sato@example.jp", password: "x", remember: false });
        expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
        await login({ email: "sato@example.jp", password: "x", remember: true });
        expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBe("1");
    });
});

describe("画面を移ったときのフォーカスと読み上げ", () => {
    const announced = (text: RegExp) => screen.findByText(text, { selector: "[aria-live]" });

    it("最初に開いたときは動かさず、移ると本文へフォーカスを移して画面の名前を読み上げる", async () => {
        const { router } = renderApp("/settings");
        await screen.findByRole("heading", { level: 1, name: "設定" });
        expect(document.body).toHaveFocus();
        expect(screen.queryByText(/の画面を開きました/)).not.toBeInTheDocument();
        await act(() => router.navigate("/no-such-page"));
        expect(await announced(/^「ページが見つかりません」の画面を開きました/)).toBeInTheDocument();
        expect(screen.getByRole("main")).toHaveFocus();
    });

    it("同じ画面の中の移動（タブ）では、フォーカスを動かさない", async () => {
        const { user } = renderApp("/settings");
        const tab = await screen.findByRole("tab", { name: "通知" });
        await user.click(tab);
        expect(tab).toHaveFocus();
        // 同じ画面なので、読み上げもしない
        expect(screen.queryByText(/の画面を開きました/)).not.toBeInTheDocument();
    });

    it("ログインを求められたときと、ログアウトしたときは、ログイン画面の見出しへ移す。ログインしたら本文へ移す", async () => {
        const { user, router } = renderApp("/settings", { loggedIn: false });
        await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "ログイン" })).toHaveFocus());
        await signInThroughForm(user);
        await waitFor(() => expect(screen.getByRole("main")).toHaveFocus());
        expect(await announced(/^「設定」の画面を開きました/)).toBeInTheDocument();
        await clickLogout(user);
        await waitFor(() => expect(router.state.location.pathname).toBe("/login"));
        await waitFor(() => expect(screen.getByRole("heading", { level: 1, name: "ログイン" })).toHaveFocus());
    });
});

describe("ログアウト", () => {
    it("ログアウトすると、読み込んだ結果を消してログイン画面へ移り、画面を開けなくなる", async () => {
        const { user, router } = renderApp("/settings");
        await screen.findByRole("textbox", { name: /表示名/ });
        await clickLogout(user);
        await waitFor(() => expect(router.state.location.pathname).toBe("/login"));
        expect(await screen.findByText("ログアウトしました")).toBeInTheDocument();
        expect(getQueryData("settings/profile")).toBeUndefined();
        await act(() => router.navigate("/settings"));
        await waitFor(() => expect(router.state.location.pathname).toBe("/login"));
    });

    it("入力の途中なら先に確かめ、「入力を続ける」を選ぶとログインしたまま入力を残す", async () => {
        const { user, router } = renderApp("/settings");
        const name = await screen.findByRole("textbox", { name: /表示名/ });
        await user.type(name, "x");
        await clickLogout(user);
        await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "入力を続ける" }));
        expect(router.state.location.pathname).toBe("/settings");
        expect(name).toHaveValue("佐藤 花子x");
        expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBe("1");

        // 破棄を選ぶと、確認は一度だけでログアウトする
        await clickLogout(user);
        await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "破棄して移動" }));
        await waitFor(() => expect(router.state.location.pathname).toBe("/login"));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
});
