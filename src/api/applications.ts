// 申請の API（ダミー）。画面はこの関数だけを通して申請を読み書きする。
// 実際の API に置き換えるときは、各関数の中身を fetch などに差し替える（戻り値の型は変えない）。

import { RECENT_ACTIVITY } from "@/mocks/activity";
import { generateApplications } from "@/mocks/applications";
import { CURRENT_USER } from "@/mocks/settings";
import { defineStore } from "./db";
import { ApiError, mockRequest } from "./mock";
import { defineQuery, invalidate } from "./query";
import {
    CATEGORY_LABELS,
    DECIDABLE,
    RETURNABLE,
    STATUS_LABELS,
    type ActivityItem,
    type Application,
    type ApplicationDetail,
    type ApplicationInput,
    type ApplicationListPage,
    type ApplicationListParams,
    type ApplicationSortKey,
    type ApplicationStatus,
} from "./applicationTypes";

const db = defineStore(() => {
    const applications = generateApplications();
    return {
        applications,
        activity: structuredClone(RECENT_ACTIVITY),
        /** 差戻しの理由（申請 id ごと）。 */
        returnReasons: {} as Record<string, string>,
        /** 払い出した受付番号の数。 */
        issued: 0,
        /**
         * 次に払い出す受付番号の通し番号。削除しても戻さない（申請の数から数えると、削除のあとで番号が重複するため）。
         * 初期データの続きから振る。
         */
        nextReceiptIndex: applications.length + 1,
    };
});

function pad(n: number, len: number): string {
    return String(n).padStart(len, "0");
}

function record(application: Application, action: string, type: ActivityItem["type"]): void {
    db.activity.unshift({
        id: `local-${db.activity.length + 1}-${Date.now()}`,
        actor: CURRENT_USER.name,
        action,
        target: `${application.number}「${application.title}」`,
        applicationId: application.id,
        at: new Date().toISOString(),
        type,
    });
}

function find(id: string): Application {
    const application = db.applications.find((a) => a.id === id);
    if (!application) throw new ApiError("指定された申請が見つかりません。削除された可能性があります。");
    return application;
}

function normalize(text: string): string {
    // 全角英数字を半角に寄せ、大文字小文字を区別せずに部分一致させる（受付番号を全角で入力しても見つかるように）
    return text
        .replace(/[Ａ-Ｚａ-ｚ０-９－]/g, (c) => (c === "－" ? "-" : String.fromCharCode(c.charCodeAt(0) - 0xfee0)))
        .toLocaleLowerCase()
        .trim();
}

const collator = new Intl.Collator("ja", { numeric: true });
const STATUS_ORDER = Object.keys(STATUS_LABELS);

/** 並べ替えに使う値。状態は表示名の五十音ではなく、手続きの進む順（下書き → 受付済み → …）で並べる。 */
const SORT_VALUE: Record<ApplicationSortKey, (a: Application) => string | number> = {
    number: (a) => a.number,
    title: (a) => a.title,
    applicant: (a) => a.applicant,
    category: (a) => CATEGORY_LABELS[a.category],
    status: (a) => STATUS_ORDER.indexOf(a.status),
    amount: (a) => a.amount,
    assignee: (a) => a.assignee,
    updatedAt: (a) => a.updatedAt,
};

function compare(a: string | number, b: string | number): number {
    return typeof a === "number" && typeof b === "number" ? a - b : collator.compare(String(a), String(b));
}

/**
 * 申請の一覧の 1 ページ分と、条件に合う総数を返す。絞り込み・並べ替え・ページ送りはここで行う
 * （画面に全件を送らないため。実際の API でも、検索条件をクエリパラメータで渡して同じ形で受け取る）。
 */
export function listApplications(params: ApplicationListParams): Promise<ApplicationListPage> {
    return mockRequest(() => {
        const keyword = normalize(params.q ?? "");
        const matched = db.applications.filter(
            (row) =>
                (!keyword || [row.number, row.title, row.applicant].some((v) => normalize(v).includes(keyword))) &&
                (!params.category || row.category === params.category) &&
                (!params.status || row.status === params.status) &&
                (!params.assignee || row.assignee === params.assignee),
        );
        const { sort } = params;
        const sorted = sort
            ? matched
                  .map((row, index) => ({ row, index }))
                  .sort((a, b) => compare(SORT_VALUE[sort.key](a.row), SORT_VALUE[sort.key](b.row)) * (sort.direction === "asc" ? 1 : -1) || a.index - b.index)
                  .map(({ row }) => row)
            : matched;
        const start = (Math.max(1, params.page) - 1) * params.pageSize;
        return { items: sorted.slice(start, start + params.pageSize), total: sorted.length };
    });
}

function listKey(params: ApplicationListParams): string {
    const sort = params.sort ? `${params.sort.key}:${params.sort.direction}` : "none";
    return new URLSearchParams({
        q: params.q ?? "",
        category: params.category ?? "",
        status: params.status ?? "",
        assignee: params.assignee ?? "",
        sort,
        page: String(params.page),
        pageSize: String(params.pageSize),
    }).toString();
}

/** 更新日時の新しい順に、最近の申請を limit 件だけ返す（ダッシュボードとヘッダーの検索の候補）。 */
export function listRecentApplications(limit: number): Promise<Application[]> {
    return mockRequest(() => [...db.applications].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, limit));
}

/** 申請の詳細。見つからないときは null（画面で「見つかりません」を出す）。 */
export function getApplication(id: string): Promise<ApplicationDetail | null> {
    return mockRequest(() => {
        const application = db.applications.find((a) => a.id === id);
        if (!application) return null;
        return {
            application,
            related: db.applications.filter((a) => a.applicant === application.applicant && a.id !== id),
            activity: db.activity.filter((a) => a.applicationId === id),
            returnReason: db.returnReasons[id],
        };
    });
}

/** 申請を作成し、払い出した受付番号を含む申請を返す。 */
export function createApplication(input: ApplicationInput): Promise<Application> {
    return mockRequest(() => {
        db.issued += 1;
        const now = new Date().toISOString();
        const index = db.nextReceiptIndex;
        db.nextReceiptIndex += 1;
        const application: Application = {
            ...input,
            id: `app-new-${pad(db.issued, 3)}`,
            number: `R08-${pad(1000 + index * 3, 6)}`,
            status: "submitted",
            submittedAt: now,
            updatedAt: now,
        };
        db.applications.unshift(application);
        record(application, "新しい申請を受け付けました", "create");
        return application;
    });
}

export function updateApplication(id: string, input: ApplicationInput): Promise<Application> {
    return mockRequest(() => {
        const application = find(id);
        Object.assign(application, input, { updatedAt: new Date().toISOString() });
        record(application, "申請内容を更新しました", "update");
        return application;
    });
}

/** 申請を削除し、削除した申請を返す（「元に戻す」で restoreApplications に渡す）。 */
export function deleteApplications(ids: string[]): Promise<Application[]> {
    return mockRequest(() => {
        const targets = new Set(ids);
        const deleted = db.applications.filter((a) => targets.has(a.id));
        db.applications = db.applications.filter((a) => !targets.has(a.id));
        return deleted;
    });
}

/** 削除した申請を元に戻す（元の並び順に戻すため、受付日時の新しい順に並べ直す）。 */
export function restoreApplications(applications: Application[]): Promise<void> {
    return mockRequest(() => {
        const existing = new Set(db.applications.map((a) => a.id));
        db.applications = [...db.applications, ...applications.filter((a) => !existing.has(a.id))].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    });
}

export function assignApplications(ids: string[], assignee: string): Promise<void> {
    return mockRequest(() => {
        for (const id of ids) {
            const application = find(id);
            application.assignee = assignee;
            application.updatedAt = new Date().toISOString();
            record(application, "担当者を変更しました", "assign");
        }
    });
}

function changeStatus(id: string, status: ApplicationStatus, action: string, type: ActivityItem["type"]): Application {
    const application = find(id);
    application.status = status;
    application.updatedAt = new Date().toISOString();
    record(application, action, type);
    return application;
}

/** 今の状態から、その操作ができるかを確かめる（二重に送られたときや、ほかの人が先に決めたときに断る）。 */
function assertStatus(id: string, allowed: ApplicationStatus[], message: string): void {
    if (!allowed.includes(find(id).status)) throw new ApiError(message);
}

export function approveApplication(id: string): Promise<Application> {
    return mockRequest(() => {
        assertStatus(id, DECIDABLE, "この申請は、すでに承認されたか、承認できない状態です。画面を読み込み直してください。");
        return changeStatus(id, "approved", "承認しました", "approve");
    });
}

export function returnApplication(id: string, reason: string): Promise<Application> {
    return mockRequest(() => {
        assertStatus(id, RETURNABLE, "この申請は、すでに差し戻されたか、差し戻せない状態です。画面を読み込み直してください。");
        db.returnReasons[id] = reason;
        return changeStatus(id, "returned", "差し戻しました", "return");
    });
}

/** 最近の操作履歴（新しい順）。 */
export function listRecentActivity(limit = 6): Promise<ActivityItem[]> {
    return mockRequest(() => db.activity.slice(0, limit));
}

/**
 * 画面が useQuery に渡す、読み込みのキーと関数の組。キーはこのファイルの中だけで決める。
 * 申請に関わるキーは "applications" で、操作履歴は "activity" で始める（invalidateApplications でまとめて読み込み直すため）。
 */
export const applicationQueries = {
    /** 申請の一覧（条件に合う 1 ページ分と総数）。 */
    list: (params: ApplicationListParams) => defineQuery(`applications/list?${listKey(params)}`, () => listApplications(params)),
    /** 更新日時の新しい順の、最近の申請。 */
    recent: (limit: number) => defineQuery(`applications/recent/${limit}`, () => listRecentApplications(limit)),
    /** 申請の詳細。 */
    detail: (id: string) => defineQuery(`applications/${id}`, () => getApplication(id)),
    /** 最近の操作履歴。ダッシュボードとヘッダーのお知らせで同じ結果を使う（件数は画面側で切る）。 */
    recentActivity: defineQuery("activity", () => listRecentActivity(6)),
};

/** 申請を変えたあとに呼ぶ。申請の一覧・詳細と、操作履歴（アクティビティ・お知らせ）を読み込み直す。 */
export function invalidateApplications(): void {
    invalidate("applications");
    invalidate("activity");
}
