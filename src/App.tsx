import { BrowserRouter, useRoutes } from "react-router";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";
import { ToastProvider } from "@/components/ui/Toast";
import { DisplaySettingsProvider } from "@/context/DisplaySettings";
import { LayoutPreferenceProvider } from "@/context/LayoutPreference";
import { routes } from "@/routes";

function AppRoutes() {
    return useRoutes(routes);
}

// アプリ全体の Provider とルーティング。テストでは MemoryRouter で AppProviders + AppRoutes を描く（src/test/renderApp.tsx）。
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

export { AppRoutes };

export default function App() {
    return (
        <BrowserRouter>
            <AppProviders>
                <AppRoutes />
            </AppProviders>
        </BrowserRouter>
    );
}
