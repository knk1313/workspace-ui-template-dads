import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Bell, LogOut, Search, Settings, UserRound } from "lucide-react";
import { appConfig } from "@/app.config";
import { CommandPalette, useCommandPaletteShortcut, type CommandItem } from "@/components/ui/CommandPalette";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { IconButton } from "@/components/ui/IconButton";
import { Popover } from "@/components/ui/Popover";
import { StackedList, StackedListItem } from "@/components/ui/StackedList";
import { Tooltip } from "@/components/ui/Tooltip";
import { useToast } from "@/components/ui/Toast";
import { authQueries, logout } from "@/api/auth";
import { useQuery } from "@/api/query";
import { useHeaderNotifications, useHeaderSearchItems } from "./headerContent";

// ヘッダー右側の操作。AppShell と TopNavLayout の両方で使う。
//   検索 = コマンドパレット（Ctrl / Cmd + K）、お知らせ = ポップオーバー、アカウント = ドロップダウンメニュー
// 検索の候補とお知らせの中身は、アプリ固有の内容として headerContent.ts に分けている。

export function HeaderActions() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [paletteOpen, setPaletteOpen] = useState(false);
    useCommandPaletteShortcut(() => setPaletteOpen(true));

    const notifications = useHeaderNotifications();
    // 名前はプロフィールの設定と同じ出どころから読む（保存すると、ここも変わる）
    const me = useQuery(authQueries.me);

    const accountItems = [
        { label: "設定", icon: Settings, onSelect: () => navigate("/settings") },
        "separator" as const,
        {
            label: "ログアウト",
            icon: LogOut,
            onSelect: async () => {
                try {
                    await logout();
                    toast({ title: "ログアウトしました", type: "info" });
                    navigate("/login");
                } catch (e) {
                    toast({ type: "error", title: "ログアウトできませんでした", description: (e as Error).message });
                }
            },
        },
    ];

    return (
        <>
            <Tooltip content="検索（Ctrl + K）" placement="bottom">
                <IconButton icon={Search} label="検索" onClick={() => setPaletteOpen(true)} />
            </Tooltip>
            <Popover title="お知らせ" placement="bottom-end" trigger={<IconButton icon={Bell} label="お知らせ" />}>
                <div className="w-72 max-w-full sm:w-80">
                    {notifications.error && <p className="m-0 p-4 text-std-16N-170 text-text">お知らせを読み込めませんでした。時間をおいて開き直してください。</p>}
                    {notifications.isLoading && <p className="m-0 p-4 text-std-16N-170 text-text-muted">読み込んでいます</p>}
                    {!notifications.error && !notifications.isLoading && notifications.items.length === 0 && (
                        <p className="m-0 p-4 text-std-16N-170 text-text-muted">新しいお知らせはありません</p>
                    )}
                    <StackedList>
                        {notifications.items.map((n) => (
                            <StackedListItem key={n.id} title={n.title} description={n.description} href={n.href} />
                        ))}
                    </StackedList>
                </div>
            </Popover>
            {/* sm 以上は名前付き、モバイルはアイコンだけ（ヘッダーの幅に収めるため）。 */}
            {/* 名前を読み込むまでは「アカウント」と出す。読み込み中であることは aria-busy で示す（E2E もこれを待つ） */}
            <div className="contents" aria-busy={me.isLoading || undefined}>
                <DropdownMenu label={me.data?.name ?? "アカウント"} icon={UserRound} align="end" className="max-sm:hidden" items={accountItems} />
            </div>
            <DropdownMenu label="アカウント" iconOnly align="end" className="sm:hidden" items={accountItems} />
            {/* 検索の候補は、開いたときに初めて読み込む（全画面で常に読み込まないため） */}
            {paletteOpen && <HeaderCommandPalette onClose={() => setPaletteOpen(false)} />}
        </>
    );
}

function HeaderCommandPalette({ onClose }: { onClose: () => void }) {
    const navigate = useNavigate();
    const searchItems = useHeaderSearchItems(navigate);
    const commands = useMemo<CommandItem[]>(() => {
        const pages: CommandItem[] = appConfig.navigation.flatMap((section) =>
            section.items.map((item) => ({
                id: `page-${item.href}`,
                label: item.label,
                group: "ページ",
                icon: item.icon,
                onSelect: () => navigate(item.href),
            })),
        );
        return [...pages, ...searchItems];
    }, [navigate, searchItems]);
    return <CommandPalette open onClose={onClose} items={commands} />;
}
