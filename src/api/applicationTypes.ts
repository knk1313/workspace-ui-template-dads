// 申請の API とやり取りするデータの型と、その表示名（見本の申請管理の画面）。画面とダミーデータの両方がここを参照する。
// 実際の API に置き換えるときも、この型（API の契約）は残し、API の応答に合わせて直す。
// 見本の画面を消すとき（npm run remove-samples）は、このファイルも消える。

export type ApplicationStatus = "draft" | "submitted" | "reviewing" | "approved" | "returned" | "rejected";
export type ApplicationCategory = "subsidy" | "permit" | "certificate" | "report" | "other";

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
    draft: "下書き",
    submitted: "受付済み",
    reviewing: "審査中",
    approved: "承認",
    returned: "差戻し",
    rejected: "不承認",
};

export const CATEGORY_LABELS: Record<ApplicationCategory, string> = {
    subsidy: "補助金",
    permit: "許認可",
    certificate: "証明書",
    report: "届出",
    other: "その他",
};

export type Application = {
    id: string;
    /** 受付番号（例: R08-000123）。 */
    number: string;
    title: string;
    applicant: string;
    organization: string;
    category: ApplicationCategory;
    status: ApplicationStatus;
    /** 申請額（円）。届出など金額のないものは 0。 */
    amount: number;
    /** 担当者。 */
    assignee: string;
    /** ISO 8601 */
    submittedAt: string;
    /** ISO 8601 */
    updatedAt: string;
    /** 添付ファイル。 */
    attachments: { name: string; size: number }[];
    memo?: string;
};

export type ActivityItem = {
    id: string;
    actor: string;
    action: string;
    target?: string;
    /** 関連する申請 ID。 */
    applicationId?: string;
    at: string;
    type: "create" | "update" | "approve" | "return" | "comment" | "assign";
};

/** 申請ごとの履歴（詳細画面のタイムライン）。 */
export type HistoryItem = {
    id: string;
    title: string;
    description?: string;
    at: string;
    status: "done" | "current" | "upcoming";
};

/** 申請の作成・更新で送る内容。 */
export type ApplicationInput = Pick<Application, "title" | "category" | "amount" | "applicant" | "organization" | "assignee"> & {
    attachments: Application["attachments"];
    memo?: string;
};

/** 申請の詳細画面に必要な情報。 */
export type ApplicationDetail = {
    application: Application;
    /** 同じ申請者のほかの申請。 */
    related: Application[];
    activity: ActivityItem[];
    returnReason?: string;
};
