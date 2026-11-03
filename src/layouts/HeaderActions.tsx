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
import { CURRENT_USER } from "@/mocks/settings";
import { useHeaderNotifications, useHeaderSearchItems } from "./headerContent";

// ヘッダー右側の操作。AppShell と TopNavLayout の両方で使う。
//   検索 = コマンドパレット（Ctrl / Cmd + K）、お知らせ = ポップオーバー、アカウント = ドロップダウンメニュー
// 検索の候補とお知らせの中身は、アプリ固有の内容として headerContent.ts に分けている。

export function HeaderActions() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [paletteOpen, setPaletteOpen] = useState(false);
    useCommandPaletteShortcut(() => setPaletteOpen(true));

    const searchItems = useHeaderSearchItems(navigate);
    const notifications = useHeaderNotifications();

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

    const accountItems = [
        { label: "設定", icon: Settings, onSelect: () => navigate("/settings") },
        "separator" as const,
        {
            label: "ログアウト",
            icon: LogOut,
            onSelect: () => {
                toast({ title: "ログアウトしました", type: "info" });
                navigate("/login");
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
            <DropdownMenu label={CURRENT_USER.name} icon={UserRound} align="end" className="max-sm:hidden" items={accountItems} />
            <DropdownMenu label="アカウント" iconOnly align="end" className="sm:hidden" items={accountItems} />
            <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} items={commands} />
        </>
    );
}
