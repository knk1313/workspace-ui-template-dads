import { useCallback, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { Check, Pencil, Trash2, Undo2 } from "lucide-react";
import { approveApplication, deleteApplications, getApplication, invalidateApplications, restoreApplications, returnApplication as returnApi } from "@/api/applications";
import { useMutation, useQuery } from "@/api/query";
import type { ApplicationStatus } from "@/api/types";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { DropdownMenu, type DropdownMenuEntry } from "@/components/ui/DropdownMenu";
import { ErrorPage } from "@/components/ui/ErrorPage";
import { LoadError } from "@/components/ui/LoadError";
import { NotificationBanner } from "@/components/ui/NotificationBanner";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { useDisplaySettings } from "@/context/DisplaySettings";
import { AttachmentsTab } from "./detail/AttachmentsTab";
import { DetailSkeleton } from "./detail/DetailSkeleton";
import { HistoryTab } from "./detail/HistoryTab";
import { OverviewTab } from "./detail/OverviewTab";
import { ReturnDialog } from "./detail/ReturnDialog";
import { ApplicationStatusChip } from "./list/ApplicationStatusChip";

// 申請の詳細。ページ見出し（件名・状態・操作）→ 状態の通知バナー → タブ（概要 / 添付ファイル / 履歴）。
// データは src/api/ のダミー API から読み書きする。承認・差戻し・削除は一覧やダッシュボードにも反映される。

/** 承認・差戻しができる状態（決定前）。 */
const DECIDABLE: ApplicationStatus[] = ["submitted", "reviewing", "returned"];
/** 差戻しができる状態（審査の途中）。 */
const RETURNABLE: ApplicationStatus[] = ["submitted", "reviewing"];

type ListLinkState = { listSearch?: string } | null;

export default function ApplicationDetailPage() {
    const { id = "" } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const { toast } = useToast();
    const { formatDateTime } = useDisplaySettings();

    // 一覧から来たときは、パンくずの「申請一覧」で同じ絞り込み条件に戻れるようにする。
    // 関連する申請へ移っても（同じ画面のまま id だけ変わる）最初に受け取った条件を保つ。
    const [listHref] = useState(() => `/applications${(location.state as ListLinkState)?.listSearch ?? ""}`);

    const fetchDetail = useCallback(() => getApplication(id), [id]);
    const detail = useQuery(`applications/${id}`, fetchDetail);
    const returnMutation = useMutation(returnApi);
    // 直前の操作の結果。別の申請に移ったら出さないよう、対象の id と組にする。
    const [notice, setNotice] = useState<{ id: string; type: "approved" | "returned" } | null>(null);
    const [returnOpen, setReturnOpen] = useState(false);

    if (detail.isLoading) return <DetailSkeleton />;
    if (detail.error && detail.data === undefined) {
        return (
            <div className="flex flex-col gap-6">
                <PageHeader title="申請の詳細" breadcrumbs={[{ label: "ホーム", href: "/" }, { label: "申請一覧", href: listHref }, { label: "詳細" }]} />
                <LoadError subject="申請" error={detail.error} onRetry={detail.reload} />
            </div>
        );
    }

    const app = detail.data?.application;
    if (!app) {
        return (
            <ErrorPage
                status={404}
                title="申請が見つかりません"
                description="指定された申請は存在しないか、削除された可能性があります。受付番号を確かめて、申請一覧から探してください。"
                actions={<ButtonLink to={listHref}>申請一覧へ戻る</ButtonLink>}
            />
        );
    }

    const { related, activity: appActivity, returnReason } = detail.data!;
    const justApproved = notice?.id === app.id && notice.type === "approved";
    const justReturned = notice?.id === app.id && notice.type === "returned";

    // 承認は申請者への通知を伴い、取り消せないため確認を取る（削除は「元に戻す」で取り消せるので確認しない）
    async function approve() {
        const ok = await confirm({
            title: "この申請を承認しますか",
            message: `${app!.number}「${app!.title}」を承認し、申請者に通知します。`,
            confirmLabel: "承認する",
        });
        if (!ok) return;
        try {
            await approveApplication(id);
            setNotice({ id, type: "approved" });
            toast({ type: "success", title: `${app!.number} を承認しました` });
        } catch (e) {
            toast({ type: "error", title: `${app!.number} を承認できませんでした`, description: (e as Error).message });
        } finally {
            invalidateApplications();
        }
    }

    async function returnApplication(reason: string) {
        try {
            await returnMutation.run(id, reason);
            setNotice({ id, type: "returned" });
            setReturnOpen(false);
            toast({ type: "success", title: `${app!.number} を差し戻しました` });
            invalidateApplications();
        } catch (e) {
            // ダイアログは閉じずに残し、入力した理由を失わずにやり直せるようにする
            toast({ type: "error", title: `${app!.number} を差し戻せませんでした`, description: (e as Error).message });
        }
    }

    async function remove() {
        const number = app!.number;
        try {
            const deleted = await deleteApplications([id]);
            invalidateApplications();
            navigate(listHref);
            toast({
                type: "success",
                title: `${number} を削除しました`,
                action: {
                    label: "元に戻す",
                    onClick: () =>
                        void restoreApplications(deleted)
                            .then(() => toast({ type: "success", title: `${number} の削除を取り消しました` }))
                            .catch((e: Error) => toast({ type: "error", title: `${number} を元に戻せませんでした`, description: e.message }))
                            .finally(() => invalidateApplications()),
                },
            });
        } catch (e) {
            toast({ type: "error", title: `${number} を削除できませんでした`, description: (e as Error).message });
        }
    }

    const menuItems: DropdownMenuEntry[] = [
        ...(RETURNABLE.includes(app.status) ? [{ label: "差戻し", icon: Undo2, onSelect: () => setReturnOpen(true) }] : []),
        { label: "削除", icon: Trash2, danger: true, onSelect: remove },
    ];

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title={app.title}
                breadcrumbs={[{ label: "ホーム", href: "/" }, { label: "申請一覧", href: listHref }, { label: app.number }]}
                meta={
                    <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span className="nums">受付番号 {app.number}</span>
                        <ApplicationStatusChip status={app.status} />
                        <span>
                            更新 <time dateTime={app.updatedAt}>{formatDateTime(app.updatedAt)}</time>
                        </span>
                    </span>
                }
                actions={
                    <>
                        <ButtonLink to={`/applications/${app.id}/edit`} variant="outline" leadIcon={Pencil}>
                            編集
                        </ButtonLink>
                        {DECIDABLE.includes(app.status) && (
                            <Button leadIcon={Check} onClick={approve}>
                                承認する
                            </Button>
                        )}
                        {/* ボタン（48px）と高さを揃える */}
                        <DropdownMenu label="その他の操作" items={menuItems} style="outlined" align="end" triggerClassName="min-h-12" />
                    </>
                }
            />

            {detail.error && <LoadError subject="申請の最新の状態" error={detail.error} onRetry={detail.reload} stale />}

            {justApproved && (
                <NotificationBanner
                    type="success"
                    title="申請を承認しました"
                    description="申請者に承認の通知を送りました（表示例のため、実際には送信されません）。"
                    live
                    onClose={() => setNotice(null)}
                />
            )}
            {app.status === "returned" && (
                <NotificationBanner
                    type="warning"
                    title="この申請は差し戻されています"
                    description={
                        returnReason ? (
                            <>
                                <span className="font-bold">差戻しの理由: </span>
                                {returnReason}
                            </>
                        ) : (
                            "申請者による修正と再提出を待っています。再提出されると状態が「受付済み」に戻ります。"
                        )
                    }
                    live={justReturned}
                />
            )}

            <Tabs
                label="申請の詳細"
                // 申請が変わったら概要タブから見せる
                key={app.id}
                items={[
                    { value: "overview", label: "概要", panel: <OverviewTab application={app} related={related} /> },
                    {
                        value: "attachments",
                        label: `添付ファイル（${app.attachments.length}）`,
                        panel: <AttachmentsTab attachments={app.attachments} />,
                    },
                    { value: "history", label: "履歴", panel: <HistoryTab status={app.status} activity={appActivity} /> },
                ]}
            />

            {returnOpen && <ReturnDialog number={app.number} pending={returnMutation.pending} onClose={() => setReturnOpen(false)} onSubmit={returnApplication} />}
        </div>
    );
}
