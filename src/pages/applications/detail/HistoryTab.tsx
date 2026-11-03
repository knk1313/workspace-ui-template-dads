import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ActivityFeed, type ActivityItem } from "@/components/ui/ActivityFeed";
import { EmptyState } from "@/components/ui/EmptyState";
import { Timeline } from "@/components/ui/Timeline";
import { useDisplaySettings } from "@/context/DisplaySettings";
import { historyFor } from "@/mocks/activity";
import { type ActivityItem as ActivityRecord } from "@/api/types";
import type { ApplicationStatus } from "@/api/types";

// 履歴タブ。手続きの進み具合（タイムライン）と、職員の操作履歴（アクティビティ）を並べる。

type Props = {
    status: ApplicationStatus;
    activity: ActivityRecord[];
};

export function HistoryTab({ status, activity }: Props) {
    const { formatDateTime } = useDisplaySettings();

    const timeline = historyFor(status).map((h) => ({
        id: h.id,
        title: h.title,
        description: h.description,
        date: h.at ? formatDateTime(h.at) : undefined,
        dateTime: h.at || undefined,
        status: h.status,
    }));

    const feed: ActivityItem[] = activity.map((a) => ({
        id: a.id,
        actor: a.actor,
        action: a.action,
        target: a.target,
        time: a.at,
        timeLabel: formatDateTime(a.at),
    }));

    return (
        <div className="grid items-start gap-6 lg:grid-cols-2">
            <Card as="section">
                <CardHeader title="処理の経過" />
                <CardBody>
                    <Timeline items={timeline} />
                </CardBody>
            </Card>
            <Card as="section">
                <CardHeader title="操作履歴" />
                <CardBody>
                    {feed.length > 0 ? (
                        <ActivityFeed items={feed} />
                    ) : (
                        <EmptyState as="h3" title="操作履歴はありません" description="担当者の変更や承認をすると、ここに記録されます" />
                    )}
                </CardBody>
            </Card>
        </div>
    );
}
