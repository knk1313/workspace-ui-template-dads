import { Avatar } from "@/components/ui/Avatar";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { DescriptionList } from "@/components/ui/DescriptionList";
import { StackedList, StackedListItem } from "@/components/ui/StackedList";
import { useDisplaySettings } from "@/context/DisplaySettings";
import { CATEGORY_LABELS, type Application } from "@/api/types";
import { findStaff } from "@/mocks/staff";
import { ApplicationStatusChip } from "../list/ApplicationStatusChip";
import { formatAmount } from "../list/format";

// 概要タブ。左に申請内容（説明リスト）、lg 以上では右に担当者と関連する申請を置く。

/** 関連する申請として表示する最大件数。 */
const RELATED_LIMIT = 5;

type Props = {
    application: Application;
    /** 同じ申請者の他の申請（画面内の状態から渡す）。 */
    related: Application[];
};

export function OverviewTab({ application: app, related }: Props) {
    const { formatDateTime } = useDisplaySettings();
    const staff = findStaff(app.assignee);
    const amount = formatAmount(app.amount);

    return (
        <div className="grid items-start gap-6 lg:grid-cols-3">
            <Card as="section" className="lg:col-span-2">
                <CardHeader title="申請内容" />
                <CardBody>
                    <DescriptionList
                        columns={2}
                        items={[
                            { term: "受付番号", description: <span className="nums">{app.number}</span> },
                            { term: "件名", description: app.title },
                            { term: "種別", description: CATEGORY_LABELS[app.category] },
                            { term: "申請者", description: app.applicant },
                            { term: "所属", description: app.organization },
                            { term: "申請額", description: amount ? <span className="nums">{amount}</span> : "なし（金額の申告がない手続き）" },
                            { term: "担当者", description: app.assignee },
                            { term: "申請日時", description: <time dateTime={app.submittedAt}>{formatDateTime(app.submittedAt)}</time> },
                            { term: "更新日時", description: <time dateTime={app.updatedAt}>{formatDateTime(app.updatedAt)}</time> },
                            { term: "メモ", description: app.memo ?? "なし" },
                        ]}
                    />
                </CardBody>
            </Card>

            <div className="flex flex-col gap-6">
                <Card as="section" padding="sm">
                    <CardHeader title="担当者" as="h2" />
                    <CardBody>
                        <div className="flex items-center gap-4">
                            <Avatar name={staff.name} size="lg" />
                            <div className="flex min-w-0 flex-col">
                                <p className="m-0 font-bold text-text-strong">{staff.name}</p>
                                <p className="m-0 text-text-muted">
                                    {staff.department}
                                    {staff.extension && `（${staff.extension}）`}
                                </p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card as="section" padding="sm" className="overflow-hidden">
                    <CardHeader title="関連する申請" description={`${app.applicant}さんが出したほかの申請です`} />
                    {related.length > 0 ? (
                        <StackedList className="mt-3 border-t border-border">
                            {related.slice(0, RELATED_LIMIT).map((r) => (
                                <StackedListItem
                                    key={r.id}
                                    title={r.title}
                                    description={
                                        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                            <span className="nums">{r.number}</span>
                                            <ApplicationStatusChip status={r.status} />
                                        </span>
                                    }
                                    href={`/applications/${r.id}`}
                                />
                            ))}
                        </StackedList>
                    ) : (
                        <CardBody>
                            <p className="m-0 text-text-muted">ほかの申請はありません。</p>
                        </CardBody>
                    )}
                </Card>
            </div>
        </div>
    );
}
