import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { AppProviders, AppRoutes } from "@/App";

// 指定した URL でアプリ全体を描画する。操作には返り値の user を使う。
export function renderApp(path: string) {
    const user = userEvent.setup();
    const result = render(
        <MemoryRouter initialEntries={[path]}>
            <AppProviders>
                <AppRoutes />
            </AppProviders>
        </MemoryRouter>,
    );
    return { user, ...result };
}
