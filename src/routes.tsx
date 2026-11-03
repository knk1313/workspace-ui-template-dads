import type { RouteObject } from "react-router";
import { AppLayout } from "@/layouts/AppLayout";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import ApplicationListPage from "@/pages/applications/ApplicationListPage";
import ApplicationDetailPage from "@/pages/applications/ApplicationDetailPage";
import ApplicationFormPage from "@/pages/applications/ApplicationFormPage";
import SettingsPage from "@/pages/settings/SettingsPage";
import LoginPage from "@/pages/auth/LoginPage";
import NotFoundPage from "@/pages/errors/NotFoundPage";
import ServerErrorPage from "@/pages/errors/ServerErrorPage";

// 画面のルーティング。ナビゲーションに出す画面は src/app.config.ts の navigation にも足す。
//   /login                       ログイン（シェルなし）
//   /                            ダッシュボード
//   /applications                一覧（検索・絞り込み・テーブル・一括操作）
//   /applications/new            作成フォーム
//   /applications/:id            詳細
//   /applications/:id/edit       編集フォーム
//   /settings                    設定
//   /error/500                   500 エラー画面のプレビュー
//   *                            404
export const routes: RouteObject[] = [
    { path: "/login", element: <LoginPage /> },
    {
        element: <AppLayout />,
        children: [
            { index: true, element: <DashboardPage /> },
            { path: "applications", element: <ApplicationListPage /> },
            { path: "applications/new", element: <ApplicationFormPage mode="create" /> },
            { path: "applications/:id", element: <ApplicationDetailPage /> },
            { path: "applications/:id/edit", element: <ApplicationFormPage mode="edit" /> },
            { path: "settings", element: <SettingsPage /> },
            { path: "error/500", element: <ServerErrorPage /> },
            { path: "*", element: <NotFoundPage /> },
        ],
    },
];
