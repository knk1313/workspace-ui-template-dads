import { useCallback, useState, type ReactNode } from "react";
import { Outlet } from "react-router";
import { PanelLeftClose, PanelLeftOpen, type LucideIcon } from "lucide-react";
import { appConfig, type NavSection } from "@/app.config";
import { cn } from "@/lib/cn";
import { Container, type ContainerSize } from "@/components/ui/Container";
import { IconButton } from "@/components/ui/IconButton";
import { SideNav, type SideNavSection } from "@/components/ui/SideNav";
import { MobileDrawer } from "./MobileDrawer";
import { Brand, HamburgerButton, ShellHeader, SkipLink } from "./ShellHeader";
import { DESKTOP_QUERY, useMediaQuery } from "./useMediaQuery";

// サイドバー型のアプリケーションシェル。
//   ┌ ヘッダー（64px: ハンバーガー（lg 未満）/ アプリ名 / headerActions）────┐
//   ├ サイドバー（lg 以上。256px、折りたたみで 72px）│ <main id="main">（地 canvas）┤
//   └ モバイル（lg 未満）はサイドバーをドロワー（role="dialog"）で開く ─────┘
// 最初の Tab で「本文へスキップ」が現れる。ヘッダーとサイドバーは白い面 + 罫線、本文は地（canvas）の上に Container で幅を制限して置く。
// ルーターの <Outlet /> を描くので、react-router の layout route としてそのまま使える（children を渡せばそれを描く）。

const MOBILE_NAV_ID = "app-mobile-nav";

export type AppShellProps = {
    /** サイドバーのナビゲーション（app.config.ts の navigation をそのまま渡せる）。 */
    navigation: readonly NavSection[] | readonly SideNavSection[];
    /** ヘッダー右側に置く要素（通知・ユーザーメニューなど）。 */
    headerActions?: ReactNode;
    /** 本文。省略時は <Outlet />。 */
    children?: ReactNode;
    appName?: string;
    logo?: LucideIcon;
    /** 本文の最大幅。 */
    containerSize?: ContainerSize;
    /** サイドバーの初期状態。 */
    defaultCollapsed?: boolean;
    /** デモなど、画面全体を占有できない場所に埋め込むとき true（main / スキップリンクを出さず、親の高さに収める）。 */
    embedded?: boolean;
    /** ナビゲーションの aria-label。同じページに複数置くとき（デモなど）に区別する。 */
    navLabel?: string;
    className?: string;
};

export function AppShell({
    navigation,
    headerActions,
    children,
    appName = appConfig.name,
    logo = appConfig.logo,
    containerSize = "lg",
    defaultCollapsed = false,
    embedded = false,
    navLabel = "メインナビゲーション",
    className,
}: AppShellProps) {
    const isDesktop = useMediaQuery(DESKTOP_QUERY);
    const [collapsed, setCollapsed] = useState(defaultCollapsed);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const closeDrawer = useCallback(() => setDrawerOpen(false), []);

    // 画面が広がってナビゲーションが常時表示になったらドロワーは閉じる（effect ではなく描画中に前回値と比べて調整する）。
    const [wasDesktop, setWasDesktop] = useState(isDesktop);
    if (wasDesktop !== isDesktop) {
        setWasDesktop(isDesktop);
        if (isDesktop) setDrawerOpen(false);
    }

    const Main = embedded ? "div" : "main";

    return (
        <div className={cn("relative flex flex-col bg-canvas text-text", embedded ? "h-full" : "h-dvh", className)}>
            {!embedded && <SkipLink />}
            <ShellHeader>
                {!isDesktop && <HamburgerButton open={drawerOpen} controls={MOBILE_NAV_ID} onClick={() => setDrawerOpen((v) => !v)} />}
                <Brand name={appName} logo={logo} />
                {headerActions && <div className="ml-auto flex shrink-0 items-center gap-1">{headerActions}</div>}
            </ShellHeader>
            <div className="flex min-h-0 flex-1">
                {isDesktop && (
                    <aside
                        className={cn(
                            "flex shrink-0 flex-col overflow-y-auto border-r border-border bg-surface transition-[width]",
                            collapsed ? "w-sidebar-collapsed" : "w-sidebar",
                        )}
                    >
                        <SideNav sections={navigation} collapsed={collapsed} label={navLabel} className="flex-1" />
                        <div className={cn("flex border-t border-border p-2", collapsed ? "justify-center" : "justify-end")}>
                            <IconButton
                                icon={collapsed ? PanelLeftOpen : PanelLeftClose}
                                label={collapsed ? "サイドバーを広げる" : "サイドバーを折りたたむ"}
                                aria-expanded={!collapsed}
                                onClick={() => setCollapsed((v) => !v)}
                            />
                        </div>
                    </aside>
                )}
                <Main id={embedded ? undefined : "main"} tabIndex={embedded ? undefined : -1} className="min-w-0 flex-1 overflow-y-auto">
                    <Container size={containerSize} flush className="px-4 py-6 md:px-8">
                        {children ?? <Outlet />}
                    </Container>
                </Main>
            </div>
            {!isDesktop && (
                <MobileDrawer open={drawerOpen} onClose={closeDrawer} id={MOBILE_NAV_ID} appName={appName} logo={logo} contained={embedded}>
                    <SideNav sections={navigation} onNavigate={closeDrawer} label={navLabel} />
                </MobileDrawer>
            )}
        </div>
    );
}
