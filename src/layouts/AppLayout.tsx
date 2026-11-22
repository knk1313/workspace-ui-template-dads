import { Suspense, useEffect, type ReactNode } from "react";
import { Navigate, Outlet, useLocation, useMatches } from "react-router";
import { authQueries } from "@/api/auth";
import { useQuery } from "@/api/query";
import { appConfig } from "@/app.config";
import { LoadError } from "@/components/ui/LoadError";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { useLayoutPreference } from "@/context/LayoutPreference";
import { AppShell } from "./AppShell";
import { HeaderActions } from "./HeaderActions";
import { TopNavLayout } from "./TopNavLayout";

// ログイン後の画面の共通レイアウト。設定画面で選んだ型（サイドバー型 / 上部ナビ型）で描き分ける。
// ページ遷移のたびにスクロール位置を先頭に戻す。
// ログインしているかを確かめてから描く。していなければログイン画面へ移し、ログインしたあとに元の画面へ戻す（docs/decisions.md D-32）。
// ルートの handle に { public: true } を付けた画面（404 と 500）は、ログインしていなくても、シェルなしで出す。

export type RouteHandle = { public?: boolean };
/** ログイン画面に渡す、ログインしたあとに戻る先。 */
export type LoginState = { from?: string } | null;

export function AppLayout() {
    const { layout } = useLayoutPreference();
    const { pathname, search, hash } = useLocation();
    const me = useQuery(authQueries.me);
    const isPublic = useMatches().some((match) => (match.handle as RouteHandle | undefined)?.public);

    useEffect(() => {
        // jsdom には scrollTo がないため、存在するときだけ呼ぶ
        if (typeof window.scrollTo === "function" && !navigator.userAgent.includes("jsdom")) window.scrollTo({ top: 0 });
    }, [pathname]);

    if (me.data === undefined) {
        return (
            <PlainPage>
                {me.error ? (
                    <>
                        <h1 className="sr-only">{appConfig.name}</h1>
                        <LoadError subject="ログインの状態" error={me.error} onRetry={me.reload} />
                    </>
                ) : (
                    <Spinner size="xl" label="ログインの状態を読み込んでいます" />
                )}
            </PlainPage>
        );
    }
    if (me.data === null) {
        if (!isPublic) return <Navigate to="/login" replace state={{ from: `${pathname}${search}${hash}` } satisfies LoginState} />;
        return (
            <PlainPage>
                <Outlet />
            </PlainPage>
        );
    }

    const Shell = layout === "topnav" ? TopNavLayout : AppShell;
    return (
        <Shell navigation={appConfig.navigation} headerActions={<HeaderActions userName={me.data.name} />}>
            {/* 開いたときに読み込む画面（src/routes.tsx の lazy）の読み込み中の表示 */}
            <Suspense fallback={<PageLoading />}>
                <Outlet />
            </Suspense>
        </Shell>
    );
}

/** シェルのない画面。 */
function PlainPage({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-dvh flex-col bg-canvas text-text">
            <main id="main" tabIndex={-1} className="flex flex-1 items-center justify-center px-4 py-12">
                {children}
            </main>
        </div>
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
