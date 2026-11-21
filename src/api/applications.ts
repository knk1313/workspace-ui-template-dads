// 申請の API（ダミー）。画面はこの関数だけを通して申請を読み書きする。
// 実際の API に置き換えるときは、各関数の中身を fetch などに差し替える（戻り値の型は変えない）。

import { RECENT_ACTIVITY } from "@/mocks/activity";
import { generateApplications } from "@/mocks/applications";
import { CURRENT_USER } from "@/mocks/settings";
import { defineStore } from "./db";
import { ApiError, mockRequest } from "./mock";
import { defineQuery, invalidate } from "./query";
import { DECIDABLE, RETURNABLE, type ActivityItem, type Application, type ApplicationDetail, type ApplicationInput, type ApplicationStatus } from "./applicationTypes";

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

/** 申請の一覧（新しい順）。絞り込み・並べ替えは画面側で行う。 */
export function listApplications(): Promise<Application[]> {
    return mockRequest(() => db.applications);
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
    /** 申請の一覧（全件）。 */
    all: defineQuery("applications", listApplications),
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
