// アクティビティ（操作履歴）の架空データ。

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

export const RECENT_ACTIVITY: ActivityItem[] = [
    { id: "act-1", actor: "鈴木 一郎", action: "承認しました", target: "R08-001012 中小企業デジタル化支援補助金", applicationId: "app-005", at: "2026-10-31T08:40:00Z", type: "approve" },
    { id: "act-2", actor: "佐藤 花子", action: "担当者を変更しました", target: "R08-001003 道路占用許可申請", applicationId: "app-002", at: "2026-10-31T08:05:00Z", type: "assign" },
    { id: "act-3", actor: "高橋 美咲", action: "差戻しました", target: "R08-001021 屋外広告物設置許可申請", applicationId: "app-008", at: "2026-10-31T07:30:00Z", type: "return" },
    { id: "act-4", actor: "田中 健太", action: "コメントを追加しました", target: "R08-001030 納税証明書交付申請", applicationId: "app-011", at: "2026-10-30T10:15:00Z", type: "comment" },
    { id: "act-5", actor: "佐藤 花子", action: "新しい申請を受け付けました", target: "R08-001189 事業所開設届", applicationId: "app-064", at: "2026-10-30T09:50:00Z", type: "create" },
    { id: "act-6", actor: "鈴木 一郎", action: "審査を開始しました", target: "R08-001045 給水装置工事届", applicationId: "app-016", at: "2026-10-30T09:10:00Z", type: "update" },
];

/** 申請ごとの履歴（詳細画面のタイムライン）。 */
export type HistoryItem = {
    id: string;
    title: string;
    description?: string;
    at: string;
    status: "done" | "current" | "upcoming";
};

export function historyFor(status: string): HistoryItem[] {
    const base: HistoryItem[] = [
        { id: "h-1", title: "受付", description: "オンライン申請を受け付けました。", at: "2026-10-20T01:12:00Z", status: "done" },
        { id: "h-2", title: "書類確認", description: "添付書類の形式を確認しました。", at: "2026-10-21T05:30:00Z", status: "done" },
        { id: "h-3", title: "審査", description: "担当者が内容を審査しています。", at: "2026-10-22T02:00:00Z", status: "current" },
        { id: "h-4", title: "決定", description: "承認または不承認を通知します。", at: "", status: "upcoming" },
    ];
    if (status === "approved" || status === "rejected") {
        return base.map((h) => ({ ...h, status: "done", at: h.at || "2026-10-28T06:00:00Z" }));
    }
    if (status === "submitted") {
        return base.map((h, i) => ({ ...h, status: i === 0 ? "done" : i === 1 ? "current" : "upcoming" }));
    }
    return base;
}
