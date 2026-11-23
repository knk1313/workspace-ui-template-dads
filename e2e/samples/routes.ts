// 見本の申請管理の画面の、すべての画面に対して行う検査の対象（e2e/routes.ts が展開する）。
// npm run remove-samples を実行すると、このディレクトリごと消える。

import type { PageRoute } from "../routes";

export const SAMPLE_PAGES: PageRoute[] = [
    { name: "dashboard", path: "/", h1: "ダッシュボード" },
    { name: "applications", path: "/applications", h1: "申請一覧" },
    { name: "application-detail", path: "/applications/app-001", h1: null },
    { name: "application-form", path: "/applications/new", h1: "新規申請" },
    { name: "application-edit", path: "/applications/app-001/edit", h1: "申請を編集" },
];
