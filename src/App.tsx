import { useState } from "react";
import { Outlet, RouterProvider, createBrowserRouter, type RouteObject } from "react-router";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";
import { ToastProvider } from "@/components/ui/Toast";
import { DisplaySettingsProvider } from "@/context/DisplaySettings";
import { LayoutPreferenceProvider } from "@/context/LayoutPreference";
import { routes } from "@/routes";

// アプリ全体の Provider とルーティング。
// 入力途中で画面を離れるときの確認（useBlocker）を使うため、データルーター（createBrowserRouter）で描く。
// Provider はルーターの内側に置く（確認ダイアログやトーストから画面遷移できるようにするため）。

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <DisplaySettingsProvider>
            <LayoutPreferenceProvider>
                <ToastProvider>
                    <ConfirmProvider>{children}</ConfirmProvider>
                </ToastProvider>
            </LayoutPreferenceProvider>
        </DisplaySettingsProvider>
    );
}

function Root() {
    return (
        <AppProviders>
            <Outlet />
        </AppProviders>
    );
}

/** ルーターに渡すルート（Provider を含む）。テストでは createMemoryRouter に渡す（src/test/renderApp.tsx）。 */
export const appRoutes: RouteObject[] = [{ element: <Root />, children: routes }];

export default function App() {
    const [router] = useState(() => createBrowserRouter(appRoutes));
    return <RouterProvider router={router} />;
}
