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

/** 承認・差戻しができる状態（決定前）。画面のボタンの出し分けと、API の検証の両方で使う。 */
export const DECIDABLE: ApplicationStatus[] = ["submitted", "reviewing", "returned"];
/** 差戻しができる状態（審査の途中）。 */
export const RETURNABLE: ApplicationStatus[] = ["submitted", "reviewing"];

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

/** 一覧で並べ替えに使える列。 */
export type ApplicationSortKey = "number" | "title" | "applicant" | "category" | "status" | "amount" | "assignee" | "updatedAt";

/** 申請の一覧の検索条件。絞り込み・並べ替え・ページ送りは API の側で行う。 */
export type ApplicationListParams = {
    /** 受付番号・件名・申請者の部分一致（全角英数字も可）。 */
    q?: string;
    category?: ApplicationCategory | "";
    status?: ApplicationStatus | "";
    assignee?: string;
    /** 並べ替え。null なら受付の新しい順（API の既定の順）。 */
    sort?: { key: ApplicationSortKey; direction: "asc" | "desc" } | null;
    /** 1 から数える。 */
    page: number;
    pageSize: number;
};

/** 申請の一覧の 1 ページ分。 */
export type ApplicationListPage = {
    items: Application[];
    /** 条件に合う申請の総数（ページ送りの表示に使う）。 */
    total: number;
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
