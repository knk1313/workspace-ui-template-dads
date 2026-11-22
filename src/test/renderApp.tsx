import { render, screen, waitFor } from "@testing-library/react";
import { expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { appRoutes } from "@/App";
import { SESSION_STORAGE_KEY, authQueries } from "@/api/auth";
import { setQueryData } from "@/api/query";
import { currentProfile } from "@/api/settings";

/** ログインした状態にする（画面がログインの確認を待たずに描かれるよう、読み込み結果も入れておく）。 */
export function signIn(): void {
    sessionStorage.setItem(SESSION_STORAGE_KEY, "1");
    setQueryData(authQueries.me, currentProfile);
}

// 指定した URL でアプリ全体を描画する。操作には返り値の user を、現在の URL の確認には router を使う。
// 既定ではログインした状態で描く。
export function renderApp(path: string, { loggedIn = true }: { loggedIn?: boolean } = {}) {
    if (loggedIn) signIn();
    const user = userEvent.setup();
    const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
    const result = render(<RouterProvider router={router} />);
    return { user, router, ...result };
}

/** renderApp のあと、画面の読み込み（「読み込んでいます」「読み込み中」の表示）が終わるまで待つ。 */
export async function renderLoaded(path: string) {
    const result = renderApp(path);
    await waitFor(() => expect(screen.queryAllByText(/^(.+を)?読み込んでいます$|^読み込み中$/)).toHaveLength(0));
    return result;
}
