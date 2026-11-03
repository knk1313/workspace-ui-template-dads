import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { appConfig } from "@/app.config";
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
        document.getElementById("main")?.scrollTo?.({ top: 0 });
    }, [pathname]);

    const Shell = layout === "topnav" ? TopNavLayout : AppShell;
    return (
        <Shell navigation={appConfig.navigation} headerActions={<HeaderActions />}>
            <Outlet />
        </Shell>
    );
}
