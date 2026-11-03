import { StatusChip, type ChipStatus } from "@/components/ui/ChipLabel";
import { STATUS_LABELS, type ApplicationStatus } from "@/mocks/applications";

// 申請の状態とチップの意味色の対応。一覧と詳細で色が揺れないよう、ここだけで決める。
// 受付済み・審査中はどちらも「処理中」の情報色にし、文字で区別する（色だけで意味を伝えない）。
export const STATUS_TONE: Record<ApplicationStatus, ChipStatus> = {
    draft: "neutral",
    submitted: "info",
    reviewing: "info",
    approved: "success",
    returned: "warning",
    rejected: "error",
};

export function ApplicationStatusChip({ status }: { status: ApplicationStatus }) {
    return <StatusChip status={STATUS_TONE[status]}>{STATUS_LABELS[status]}</StatusChip>;
}
