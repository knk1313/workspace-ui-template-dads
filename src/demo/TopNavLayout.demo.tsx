import { Bell } from "lucide-react";
import { appConfig } from "@/app.config";
import { IconButton } from "@/components/ui/IconButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { TopNavLayout } from "@/layouts/TopNavLayout";
import type { ComponentDemo } from "./types";

const demo: ComponentDemo = {
    slug: "top-nav-layout",
    title: "アプリケーションシェル（上部ナビ型）",
    category: "レイアウト",
    description:
        "ヘッダーに水平メニューを置くレイアウト。項目が少ないアプリ向け。lg 未満ではハンバーガーメニューから全幅のモバイルメニューを開く。Props は AppShell と同じ。",
    dadsUrl: "https://design.digital.go.jp/dads/components/mobile-menu/",
    source: "@/layouts/TopNavLayout",
    examples: [
        {
            title: "縮小表示",
            description: "実際は画面全体を占有する。ここでは embedded で枠内に収めている。",
            render: () => (
                <div className="h-96 overflow-hidden rounded-8 border border-border">
                    <TopNavLayout
                        embedded
                        navigation={appConfig.navigation}
                        navLabel="上部ナビ型レイアウトのナビゲーション（デモ）"
                        headerActions={<IconButton icon={Bell} label="通知" />}
                    >
                        <PageHeader title="ダッシュボード" description="本文はここに入る。" />
                    </TopNavLayout>
                </div>
            ),
        },
    ],
};

export default demo;
