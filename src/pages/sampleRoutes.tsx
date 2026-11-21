import { lazy } from "react";
import type { RouteObject } from "react-router";
import ApplicationListPage from "@/pages/applications/ApplicationListPage";
import ApplicationDetailPage from "@/pages/applications/ApplicationDetailPage";
import ApplicationFormPage from "@/pages/applications/ApplicationFormPage";

// 見本の申請管理の画面のルート。src/routes.tsx がシェルの中に展開する。
// npm run remove-samples を実行すると、このファイルは消え、src/routes.tsx の展開の行がホームの画面に置き換わる。
//   /                            ダッシュボード
//   /applications                一覧（検索・絞り込み・テーブル・一括操作）
//   /applications/new            作成フォーム
//   /applications/:id            詳細
//   /applications/:id/edit       編集フォーム

// グラフのライブラリー（recharts）を使う画面は、開いたときに読み込む（ほかの画面の最初の読み込みに含めないため）。
// 読み込み中は AppLayout の Suspense が「画面を読み込んでいます」を出す。
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));

export const sampleRoutes: RouteObject[] = [
    { index: true, element: <DashboardPage /> },
    { path: "applications", element: <ApplicationListPage /> },
    { path: "applications/new", element: <ApplicationFormPage mode="create" /> },
    { path: "applications/:id", element: <ApplicationDetailPage /> },
    { path: "applications/:id/edit", element: <ApplicationFormPage mode="edit" /> },
];
