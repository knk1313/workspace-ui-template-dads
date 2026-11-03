import { useMemo } from "react";
import { FileText } from "lucide-react";
import { listApplications, listRecentActivity } from "@/api/applications";
import { useQuery } from "@/api/query";
import type { CommandItem } from "@/components/ui/CommandPalette";

// ヘッダーの検索（コマンドパレット）とお知らせに出す、アプリ固有の内容。
// 見本の申請管理の画面のデータを使っている。自分のアプリにするときは、このファイルを書き換える。
// npm run remove-samples を実行すると、何も出さない版に置き換わる。

export type HeaderNotification = { id: string; title: string; description?: string; href?: string };

export type HeaderNotifications = {
    items: HeaderNotification[];
    isLoading: boolean;
    error: Error | undefined;
};

const fetchNotifications = () => listRecentActivity(3);

/** 検索で、ナビゲーションの画面に加えて出す候補（見本では最近の申請）。 */
export function useHeaderSearchItems(navigate: (to: string) => void): CommandItem[] {
    const applications = useQuery("applications", listApplications);
    return useMemo(
        () =>
            (applications.data ?? []).slice(0, 20).map((a) => ({
                id: `app-${a.id}`,
                label: `${a.number}「${a.title}」`,
                group: "申請",
                icon: FileText,
                keywords: [a.applicant, a.organization],
                onSelect: () => navigate(`/applications/${a.id}`),
            })),
        [applications.data, navigate],
    );
}

/** お知らせ（見本では最近の操作の履歴）。 */
export function useHeaderNotifications(): HeaderNotifications {
    const activity = useQuery("activity/notifications", fetchNotifications);
    const items = useMemo(
        () =>
            (activity.data ?? []).map((a) => ({
                id: a.id,
                title: `${a.actor}が${a.action}`,
                description: a.target,
                href: a.applicationId ? `/applications/${a.applicationId}` : undefined,
            })),
        [activity.data],
    );
    return { items, isLoading: activity.isLoading, error: activity.data ? undefined : activity.error };
}
