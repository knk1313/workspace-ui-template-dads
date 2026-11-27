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
import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/useMediaQuery";

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
    // サイドバーの幅が変わっている途中か
    const [resizing, setResizing] = useState(false);
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
        <div className={cn("relative flex flex-col bg-canvas text-text", embedded ? "h-full" : "min-h-dvh", className)}>
            {!embedded && <SkipLink />}
            <ShellHeader className={embedded ? undefined : "sticky top-0 z-20"}>
                {!isDesktop && <HamburgerButton open={drawerOpen} controls={MOBILE_NAV_ID} onClick={() => setDrawerOpen((v) => !v)} />}
                <Brand name={appName} logo={logo} />
                {headerActions && <div className="ml-auto flex shrink-0 items-center gap-1">{headerActions}</div>}
            </ShellHeader>
            <div className="flex min-h-0 flex-1">
                {isDesktop && (
                    // 本文はページ全体でスクロールし、サイドバーはヘッダーの下に固定する
                    // （本文だけを内側でスクロールさせると、画面外の要素にフォーカスしたときに画面全体がずれるため）。
                    // 背景と罫線は外側の列に持たせ、長いページでもサイドバーの白い面が途中で切れないようにする。
                    // 幅のアニメーションは外側の列だけにかけ、中身は最初から開閉後の幅で描いて、はみ出す分を切り取る
                    // （中身の幅も一緒に変えると、広がる途中の狭い幅でラベルが何行にも折り返される）。
                    // overflow-x-hidden にするとスクロールの入れ物になり、中の sticky が効かなくなるため、clip を使う。
                    // 切り取るのは開閉の途中だけにする（付けたままにすると、本文の文字の描かれ方までわずかに変わる）。
                    <div
                        className={cn(
                            "shrink-0 border-r border-border bg-surface transition-[width]",
                            collapsed ? "w-sidebar-collapsed" : "w-sidebar",
                            resizing && "overflow-x-clip",
                        )}
                        onTransitionEnd={(e) => {
                            // 中のリンクなどの transition は無視する
                            if (e.target === e.currentTarget) setResizing(false);
                        }}
                    >
                    <aside
                        className={cn(
                            // 透明の罫線は、外側の列の罫線と同じ幅を空けるため（中身の幅を、外側の列の内側とそろえる）
                            "flex flex-col overflow-y-auto border-r border-transparent",
                            collapsed ? "w-sidebar-collapsed" : "w-sidebar",
                            embedded ? "h-full" : "sticky top-header h-below-header",
                        )}
                    >
                        <SideNav sections={navigation} collapsed={collapsed} label={navLabel} className="flex-1" />
                        <div className={cn("flex border-t border-border p-2", collapsed ? "justify-center" : "justify-end")}>
                            <IconButton
                                icon={collapsed ? PanelLeftOpen : PanelLeftClose}
                                label={collapsed ? "サイドバーを広げる" : "サイドバーを折りたたむ"}
                                aria-expanded={!collapsed}
                                onClick={() => {
                                    setResizing(true);
                                    setCollapsed((v) => !v);
                                }}
                            />
                        </div>
                    </aside>
                    </div>
                )}
                <Main id={embedded ? undefined : "main"} tabIndex={embedded ? undefined : -1} className={cn("min-w-0 flex-1", embedded && "overflow-y-auto")}>
                    <Container size={containerSize} flush className="px-page-x py-page-y md:px-page-x-wide">
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
