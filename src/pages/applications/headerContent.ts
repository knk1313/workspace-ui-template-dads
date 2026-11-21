import { useMemo } from "react";
import { FileText } from "lucide-react";
import { applicationQueries } from "@/api/applications";
import { useQuery } from "@/api/query";
import type { CommandItem } from "@/components/ui/CommandPalette";

import type { HeaderNotifications } from "@/layouts/headerContent";

// ヘッダーの検索の候補とお知らせ（見本の申請管理の画面のデータを使う版）。src/layouts/headerContent.ts が読み込む。
// npm run remove-samples を実行すると、このファイルは消え、src/layouts/headerContentEmpty.ts（何も出さない版）に切り替わる。

/**
 * 検索で、ナビゲーションの画面に加えて出す候補（見本では最近の申請20件）。
 * 検索を開いたときだけ呼ばれる（HeaderActions はパレットを開いている間だけこのフックを使う部品を描く）。
 */
export function useHeaderSearchItems(navigate: (to: string) => void): CommandItem[] {
    const applications = useQuery(applicationQueries.recent(20));
    return useMemo(
        () =>
            (applications.data ?? []).map((a) => ({
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
    // ダッシュボードの「最近の操作」と同じ結果を使い、新しい3件だけを出す（同じ履歴を2回読み込まないため）
    const activity = useQuery(applicationQueries.recentActivity);
    const items = useMemo(
        () =>
            (activity.data ?? []).slice(0, 3).map((a) => ({
                id: a.id,
                title: `${a.actor}が${a.action}`,
                description: a.target,
                href: a.applicationId ? `/applications/${a.applicationId}` : undefined,
            })),
        [activity.data],
    );
    return { items, isLoading: activity.isLoading, error: activity.data ? undefined : activity.error };
}
