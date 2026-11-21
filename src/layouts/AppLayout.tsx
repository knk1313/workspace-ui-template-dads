import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { appConfig } from "@/app.config";
import { Skeleton } from "@/components/ui/Skeleton";
import { useLayoutPreference } from "@/context/LayoutPreference";
import { AppShell } from "./AppShell";
import { HeaderActions } from "./HeaderActions";
import { TopNavLayout } from "./TopNavLayout";

// ログイン後の画面の共通レイアウト。設定画面で選んだ型（サイドバー型 / 上部ナビ型）で描き分ける。
// ページ遷移のたびにスクロール位置を先頭に戻す。
export function AppLayout() {
    const { layout } = useLayoutPreference();
    const { pathname } = useLocation();

    useEffect(() => {
        // jsdom には scrollTo がないため、存在するときだけ呼ぶ
        if (typeof window.scrollTo === "function" && !navigator.userAgent.includes("jsdom")) window.scrollTo({ top: 0 });
    }, [pathname]);

    const Shell = layout === "topnav" ? TopNavLayout : AppShell;
    return (
        <Shell navigation={appConfig.navigation} headerActions={<HeaderActions />}>
            {/* 開いたときに読み込む画面（src/routes.tsx の lazy）の読み込み中の表示 */}
            <Suspense fallback={<PageLoading />}>
                <Outlet />
            </Suspense>
        </Shell>
    );
}

function PageLoading() {
    return (
        <div className="flex flex-col gap-6" aria-busy="true">
            <p role="status" className="sr-only">
                画面を読み込んでいます
            </p>
            <Skeleton className="w-64" />
            <Skeleton lines={6} />
        </div>
    );
}
