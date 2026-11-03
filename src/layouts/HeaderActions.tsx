import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Bell, FileText, LogOut, Search, Settings, UserRound } from "lucide-react";
import { appConfig } from "@/app.config";
import { CommandPalette, useCommandPaletteShortcut, type CommandItem } from "@/components/ui/CommandPalette";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { IconButton } from "@/components/ui/IconButton";
import { Popover } from "@/components/ui/Popover";
import { StackedList, StackedListItem } from "@/components/ui/StackedList";
import { Tooltip } from "@/components/ui/Tooltip";
import { useToast } from "@/components/ui/Toast";
import { listApplications, listRecentActivity } from "@/api/applications";
import { useQuery } from "@/api/query";
import { CURRENT_USER } from "@/mocks/applications";

// ヘッダー右側の操作。AppShell と TopNavLayout の両方で使う。
//   検索 = コマンドパレット（Ctrl / Cmd + K）、お知らせ = ポップオーバー、アカウント = ドロップダウンメニュー
const fetchNotifications = () => listRecentActivity(3);

export function HeaderActions() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [paletteOpen, setPaletteOpen] = useState(false);
    useCommandPaletteShortcut(() => setPaletteOpen(true));

    const applications = useQuery("applications", listApplications);
    const notifications = useQuery("activity/notifications", fetchNotifications);

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
        const apps: CommandItem[] = (applications.data ?? []).slice(0, 20).map((a) => ({
            id: `app-${a.id}`,
            label: `${a.number} ${a.title}`,
            group: "申請",
            icon: FileText,
            keywords: [a.applicant, a.organization],
            onSelect: () => navigate(`/applications/${a.id}`),
        }));
        return [...pages, ...apps];
    }, [navigate, applications.data]);

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
                    {notifications.error && !notifications.data && <p className="m-0 p-4 text-std-16N-170 text-text">お知らせを読み込めませんでした。時間をおいて開き直してください。</p>}
                    {notifications.isLoading && <p className="m-0 p-4 text-std-16N-170 text-text-muted">読み込んでいます</p>}
                    <StackedList>
                        {(notifications.data ?? []).map((a) => (
                            <StackedListItem
                                key={a.id}
                                title={`${a.actor}が${a.action}`}
                                description={a.target}
                                href={a.applicationId ? `/applications/${a.applicationId}` : undefined}
                            />
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
