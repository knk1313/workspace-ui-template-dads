// E2E と見た目の回帰テストで、すべての画面に対して行う検査の対象。
// 画面を足したら、ここにも足す（h1 は画面の見出し。読み込むまで決まらないときは null）。
// 見本の申請管理の画面は e2e/samples/routes.ts にある。npm run remove-samples を実行すると、そこがホームの画面に置き換わる。

import { SAMPLE_PAGES } from "./samples/routes";

export type PageRoute = { name: string; path: string; h1: string | null };

export const PAGES: PageRoute[] = [
    ...SAMPLE_PAGES,
    { name: "settings-profile", path: "/settings", h1: "設定" },
    { name: "settings-notifications", path: "/settings?tab=notifications", h1: "設定" },
    { name: "settings-display", path: "/settings?tab=display", h1: "設定" },
    { name: "login", path: "/login", h1: "ログイン" },
    { name: "not-found", path: "/no-such-page", h1: "ページが見つかりません" },
    { name: "server-error", path: "/error/500", h1: "ページを表示できません" },
];
