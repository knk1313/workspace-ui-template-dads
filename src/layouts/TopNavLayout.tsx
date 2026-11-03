import { useCallback, useState, type ReactNode } from "react";
import { Outlet } from "react-router";
import type { LucideIcon } from "lucide-react";
import { appConfig, type NavSection } from "@/app.config";
import { cn } from "@/lib/cn";
import { Container, type ContainerSize } from "@/components/ui/Container";
import { HeaderNav } from "@/components/ui/HeaderNav";
import { SideNav, type SideNavSection } from "@/components/ui/SideNav";
import { MobileDrawer } from "./MobileDrawer";
import { Brand, HamburgerButton, ShellHeader, SkipLink } from "./ShellHeader";
import { DESKTOP_QUERY, useMediaQuery } from "./useMediaQuery";

// 上部ナビゲーション型のアプリケーションシェル。
//   ┌ ヘッダー（64px: アプリ名 / 水平メニュー（lg 以上）/ headerActions。lg 未満はハンバーガー）┐
//   └ <main id="main">（地 canvas、Container で幅を制限）──────────────────────────────┘
// lg 未満では DADS モバイルメニューとして全幅のドロワーにセクション付きのメニュー（SideNav）を表示する。
// 項目が少ない（5 つ程度まで）アプリ向け。Props は AppShell と同じ。

const MOBILE_NAV_ID = "app-mobile-nav";

export type TopNavLayoutProps = {
    navigation: readonly NavSection[] | readonly SideNavSection[];
    headerActions?: ReactNode;
    children?: ReactNode;
    appName?: string;
    logo?: LucideIcon;
    containerSize?: ContainerSize;
    /** デモなど、画面全体を占有できない場所に埋め込むとき true。 */
    embedded?: boolean;
    /** ナビゲーションの aria-label。同じページに複数置くとき（デモなど）に区別する。 */
    navLabel?: string;
    className?: string;
};

export function TopNavLayout({
    navigation,
    headerActions,
    children,
    appName = appConfig.name,
    logo = appConfig.logo,
    containerSize = "lg",
    embedded = false,
    navLabel = "メインナビゲーション",
    className,
}: TopNavLayoutProps) {
    const isDesktop = useMediaQuery(DESKTOP_QUERY);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const closeDrawer = useCallback(() => setDrawerOpen(false), []);

    // 画面が広がってナビゲーションが常時表示になったらドロワーは閉じる（effect ではなく描画中に前回値と比べて調整する）。
    const [wasDesktop, setWasDesktop] = useState(isDesktop);
    if (wasDesktop !== isDesktop) {
        setWasDesktop(isDesktop);
        if (isDesktop) setDrawerOpen(false);
    }

    // 水平メニューはセクションを平らにして並べる（セクション見出しはモバイルメニューだけで使う）。
    const items = navigation.flatMap((section) => section.items.map((item) => ({ label: item.label, href: item.href, icon: item.icon })));
    const Main = embedded ? "div" : "main";

    return (
        <div className={cn("relative flex flex-col bg-canvas text-text", embedded ? "h-full" : "min-h-dvh", className)}>
            {!embedded && <SkipLink />}
            <ShellHeader className="sticky top-0 z-20">
                {!isDesktop && <HamburgerButton open={drawerOpen} controls={MOBILE_NAV_ID} onClick={() => setDrawerOpen((v) => !v)} />}
                <Brand name={appName} logo={logo} />
                {isDesktop && <HeaderNav items={items} label={navLabel} className="ml-2 h-full" />}
                {headerActions && <div className="ml-auto flex shrink-0 items-center gap-1">{headerActions}</div>}
            </ShellHeader>
            <Main id={embedded ? undefined : "main"} tabIndex={embedded ? undefined : -1} className={cn("min-w-0 flex-1", embedded && "overflow-y-auto")}>
                <Container size={containerSize} flush className="px-4 py-6 md:px-8">
                    {children ?? <Outlet />}
                </Container>
            </Main>
            {!isDesktop && (
                <MobileDrawer open={drawerOpen} onClose={closeDrawer} id={MOBILE_NAV_ID} appName={appName} logo={logo} width="full" contained={embedded}>
                    <SideNav sections={navigation} onNavigate={closeDrawer} label={navLabel} />
                </MobileDrawer>
            )}
        </div>
    );
}
