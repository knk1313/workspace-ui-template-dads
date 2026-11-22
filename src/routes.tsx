import type { RouteObject } from "react-router";
import { AppLayout } from "@/layouts/AppLayout";
import { sampleRoutes } from "@/pages/sampleRoutes";
import SettingsPage from "@/pages/settings/SettingsPage";
import LoginPage from "@/pages/auth/LoginPage";
import NotFoundPage from "@/pages/errors/NotFoundPage";
import ServerErrorPage from "@/pages/errors/ServerErrorPage";

// 画面のルーティング。ナビゲーションに出す画面は src/app.config.ts の navigation にも足す。
//   /login       ログイン（シェルなし）
//   （見本）     ダッシュボードと申請の画面（src/pages/sampleRoutes.tsx）
//   /settings    設定
//   /error/500   500 エラー画面のプレビュー
//   *            404
export const routes: RouteObject[] = [
    { path: "/login", element: <LoginPage /> },
    {
        element: <AppLayout />,
        children: [
            ...sampleRoutes,
            { path: "settings", element: <SettingsPage /> },
            // handle の public は、ログインしていなくても見られる画面
            { path: "error/500", element: <ServerErrorPage />, handle: { public: true } },
            { path: "*", element: <NotFoundPage />, handle: { public: true } },
        ],
    },
];
