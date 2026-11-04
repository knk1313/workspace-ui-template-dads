import { useState } from "react";
import { Outlet, RouterProvider, createBrowserRouter, type RouteObject } from "react-router";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";
import { ToastProvider } from "@/components/ui/Toast";
import { DisplaySettingsProvider } from "@/context/DisplaySettings";
import { LayoutPreferenceProvider } from "@/context/LayoutPreference";
import { ThemePreferenceProvider } from "@/context/ThemePreference";
import { UnsavedChangesProvider } from "@/hooks/useUnsavedChangesWarning";
import { routes } from "@/routes";

// アプリ全体の Provider とルーティング。
// 入力途中で画面を離れるときの確認（useBlocker）を使うため、データルーター（createBrowserRouter）で描く。
// Provider はルーターの内側に置く（確認ダイアログやトーストから画面遷移できるようにするため）。

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemePreferenceProvider>
            <DisplaySettingsProvider>
                <LayoutPreferenceProvider>
                    <ToastProvider>
                        <ConfirmProvider>{children}</ConfirmProvider>
                    </ToastProvider>
                </LayoutPreferenceProvider>
            </DisplaySettingsProvider>
        </ThemePreferenceProvider>
    );
}

function Root() {
    return (
        <AppProviders>
            {/* 入力途中で画面を離れるときの確認。ルーターに一つだけ置く（useUnsavedChangesWarning） */}
            <UnsavedChangesProvider>
                <Outlet />
            </UnsavedChangesProvider>
        </AppProviders>
    );
}

/** ルーターに渡すルート（Provider を含む）。テストでは createMemoryRouter に渡す（src/test/renderApp.tsx）。 */
export const appRoutes: RouteObject[] = [{ element: <Root />, children: routes }];

/** ルーターの基準のパス。vite.config.ts の base（BASE_PATH）に合わせる。末尾の / は付けない。 */
const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

export default function App() {
    const [router] = useState(() => createBrowserRouter(appRoutes, { basename: BASENAME }));
    return <RouterProvider router={router} />;
}
