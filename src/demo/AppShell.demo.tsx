import { Bell } from "lucide-react";
import { appConfig } from "@/app.config";
import { IconButton } from "@/components/ui/IconButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { AppShell } from "@/layouts/AppShell";
import type { ComponentDemo } from "./types";

const demo: ComponentDemo = {
    slug: "app-shell",
    title: "アプリケーションシェル（サイドバー型）",
    category: "レイアウト",
    description:
        "ヘッダー + 左サイドバー + 本文の管理画面レイアウト。lg 以上でサイドバーを常時表示（折りたたみ可）、lg 未満はハンバーガーメニューからドロワーで開く。先頭に「本文へスキップ」リンクを置く。",
    dadsUrl: "https://design.digital.go.jp/dads/components/hamburger-menu-button/",
    source: "@/layouts/AppShell",
    examples: [
        {
            title: "縮小表示",
            description:
                "実際は画面全体を占有する。ここでは embedded で枠内に収めている（スキップリンクと main は出さない）。react-router の layout route として使うと <Outlet /> を描く。",
            render: () => (
                <div className="h-96 overflow-hidden rounded-8 border border-border">
                    <AppShell
                        embedded
                        navigation={appConfig.navigation}
                        navLabel="サイドバー型レイアウトのナビゲーション（デモ）"
                        headerActions={<IconButton icon={Bell} label="通知" />}
                    >
                        <PageHeader title="ダッシュボード" description="本文はここに入る。" breadcrumbLabel="パンくずリスト（シェルのデモ）" />
                    </AppShell>
                </div>
            ),
        },
    ],
};

export default demo;
