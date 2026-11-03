// 見本の申請管理の画面（ダッシュボード・申請一覧・詳細・作成フォーム）を消し、自分のアプリを作り始められる最小の構成にする。
//   npm run remove-samples
// 残るもの: UI 部品（src/components/）、シェル、設定・ログイン・404・500 の画面、ダミー API の仕組み、検査の仕組み。
// 消したあとは npm run check と npm run test:e2e で動くことを確かめ、npm run test:visual:update で基準画像を撮り直す。
// 元に戻したいときは git checkout . と git clean -fd で戻せる（実行前に、変更をすべてコミットしておく）。

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const force = process.argv.includes("--force");

function fail(message) {
    console.error(`remove-samples: ${message}`);
    process.exit(1);
}

if (!existsSync("src/pages/applications")) fail("見本の画面は、すでに消してあります。");

if (!force) {
    let status = "";
    try {
        status = execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" });
    } catch {
        fail("git の状態を確かめられませんでした。git の管理下で実行するか、--force を付けてください。");
    }
    if (status.trim()) fail("コミットしていない変更があります。元に戻せるよう、先にコミットしてから実行してください（--force で無視できます）。");
}

const REMOVE = [
    "src/pages/applications",
    "src/pages/dashboard",
    "src/api/applications.ts",
    "src/api/applicationTypes.ts",
    "src/mocks/applications.ts",
    "src/mocks/activity.ts",
    "src/mocks/applicationForm.ts",
    "src/mocks/staff.ts",
    "src/mocks/dashboard.ts",
    "e2e/samples",
    "e2e/visual/samples.spec.ts",
    // 画面が変わるため、見た目の回帰テストの基準画像は撮り直す
    "e2e/visual/__screenshots__",
];

const WRITE = {
    "src/pages/home/HomePage.tsx": `import { Settings } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

// ホーム。自分のアプリの最初の画面に書き換える。
// 画面を足すときは、src/pages/ に画面を作り、src/routes.tsx にルートを、src/app.config.ts の navigation に項目を足す。
export default function HomePage() {
    return (
        <div className="flex flex-col gap-6">
            <PageHeader title="ホーム" description="ここに、アプリの最初の画面を作ります" />
            <Card>
                <CardBody>
                    <EmptyState
                        title="最初の画面を作成"
                        description="src/pages/home/HomePage.tsxを書き換えると、ここに表示されます。部品の使い方は、src/components/にある各ファイルを参照してください。"
                        action={
                            <ButtonLink to="/settings" variant="outline" leadIcon={Settings}>
                                設定を開く
                            </ButtonLink>
                        }
                    />
                </CardBody>
            </Card>
        </div>
    );
}
`,
    "src/pages/home/HomePage.test.tsx": `import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { renderApp } from "@/test/renderApp";

describe("HomePage", () => {
    it("見出しと、最初の画面の作り方を表示する", async () => {
        const { container } = renderApp("/");
        expect(screen.getByRole("heading", { level: 1, name: "ホーム" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "設定を開く" })).toHaveAttribute("href", "/settings");
        await expectNoA11yViolations(container);
    });
});
`,
    "src/routes.tsx": `import type { RouteObject } from "react-router";
import { AppLayout } from "@/layouts/AppLayout";
import HomePage from "@/pages/home/HomePage";
import SettingsPage from "@/pages/settings/SettingsPage";
import LoginPage from "@/pages/auth/LoginPage";
import NotFoundPage from "@/pages/errors/NotFoundPage";
import ServerErrorPage from "@/pages/errors/ServerErrorPage";

// 画面のルーティング。ナビゲーションに出す画面は src/app.config.ts の navigation にも足す。
//   /login       ログイン（シェルなし）
//   /            ホーム
//   /settings    設定
//   /error/500   500 エラー画面のプレビュー
//   *            404
export const routes: RouteObject[] = [
    { path: "/login", element: <LoginPage /> },
    {
        element: <AppLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "settings", element: <SettingsPage /> },
            { path: "error/500", element: <ServerErrorPage /> },
            { path: "*", element: <NotFoundPage /> },
        ],
    },
];
`,
    "src/layouts/headerContent.ts": `import type { CommandItem } from "@/components/ui/CommandPalette";

// ヘッダーの検索（コマンドパレット）とお知らせに出す、アプリ固有の内容。
// 検索の候補を足したり、お知らせを API から読み込んだりするときは、このファイルを書き換える。

export type HeaderNotification = { id: string; title: string; description?: string; href?: string };

export type HeaderNotifications = {
    items: HeaderNotification[];
    isLoading: boolean;
    error: Error | undefined;
};

const NO_ITEMS: CommandItem[] = [];
const NO_NOTIFICATIONS: HeaderNotifications = { items: [], isLoading: false, error: undefined };

/** 検索で、ナビゲーションの画面に加えて出す候補。 */
export function useHeaderSearchItems(navigate: (to: string) => void): CommandItem[] {
    void navigate; // 候補を足すときは、onSelect で navigate("/…") を呼ぶ
    return NO_ITEMS;
}

/** お知らせ。 */
export function useHeaderNotifications(): HeaderNotifications {
    return NO_NOTIFICATIONS;
}
`,
    "e2e/routes.ts": `// E2E と見た目の回帰テストで、すべての画面に対して行う検査の対象。
// 画面を足したら、ここにも足す（h1 は画面の見出し。読み込むまで決まらないときは null）。

export type PageRoute = { name: string; path: string; h1: string | null };

export const PAGES: PageRoute[] = [
    { name: "home", path: "/", h1: "ホーム" },
    { name: "settings-profile", path: "/settings", h1: "設定" },
    { name: "settings-notifications", path: "/settings?tab=notifications", h1: "設定" },
    { name: "settings-display", path: "/settings?tab=display", h1: "設定" },
    { name: "login", path: "/login", h1: "ログイン" },
    { name: "not-found", path: "/no-such-page", h1: "ページが見つかりません" },
    { name: "server-error", path: "/error/500", h1: "ページを表示できません" },
];
`,
};

/** ファイルの一部を置き換える。置き換え元が見つからないときは止める（テンプレートが変わったことに気付けるように）。 */
function replaceIn(path, pattern, replacement) {
    const text = readFileSync(path, "utf8");
    if (!pattern.test(text)) fail(`${path} の書き換える箇所が見つかりません。手で直してください。`);
    writeFileSync(path, text.replace(pattern, replacement));
}

for (const path of REMOVE) {
    rmSync(path, { recursive: true, force: true });
    console.log(`消した: ${path}`);
}
for (const [path, content] of Object.entries(WRITE)) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
    console.log(`書いた: ${path}`);
}

replaceIn(
    "src/app.config.ts",
    /const navigation = \[[\s\S]*?\] as const satisfies readonly NavSection\[\];/,
    `const navigation = [
    {
        items: [{ label: "ホーム", href: "/", icon: House, end: true }],
    },
    {
        title: "管理",
        items: [{ label: "設定", href: "/settings", icon: Settings, end: true }],
    },
] as const satisfies readonly NavSection[];`,
);
replaceIn("src/app.config.ts", /import \{[^}]*\} from "lucide-react";/, `import { House, Landmark, Settings, type LucideIcon } from "lucide-react";`);
console.log("書き換えた: src/app.config.ts（ナビゲーション）");

console.log(`
見本の画面を消しました。次の手順で確かめてください。
  1. npm run check            型・lint・単体テスト
  2. npm run test:e2e         E2E
  3. npm run test:visual:update  見た目の回帰テストの基準画像を撮り直す（Docker が必要）
README の画面のスクリーンショット（docs/screenshots/）と、見本の画面の文言表（docs/ui-text.md）は残しています。不要なら消してください。`);
