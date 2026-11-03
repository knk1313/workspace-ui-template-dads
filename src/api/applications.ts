// 申請の API（ダミー）。画面はこの関数だけを通して申請を読み書きする。
// 実際の API に置き換えるときは、各関数の中身を fetch などに差し替える（戻り値の型は変えない）。

import { CURRENT_USER } from "@/mocks/applications";
import { db } from "./db";
import { ApiError, mockRequest } from "./mock";
import { invalidate } from "./query";
import type { ActivityItem, Application, ApplicationDetail, ApplicationInput, ApplicationStatus } from "./types";

function pad(n: number, len: number): string {
    return String(n).padStart(len, "0");
}

function record(application: Application, action: string, type: ActivityItem["type"]): void {
    db.activity.unshift({
        id: `local-${db.activity.length + 1}-${Date.now()}`,
        actor: CURRENT_USER.name,
        action,
        target: `${application.number} ${application.title}`,
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
        const index = db.applications.length + db.issued;
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

export function approveApplication(id: string): Promise<Application> {
    return mockRequest(() => changeStatus(id, "approved", "承認しました", "approve"));
}

export function returnApplication(id: string, reason: string): Promise<Application> {
    return mockRequest(() => {
        db.returnReasons[id] = reason;
        return changeStatus(id, "returned", "差戻しました", "return");
    });
}

/** 最近の操作履歴（新しい順）。 */
export function listRecentActivity(limit = 6): Promise<ActivityItem[]> {
    return mockRequest(() => db.activity.slice(0, limit));
}

/** 申請を変えたあとに呼ぶ。申請の一覧・詳細と、操作履歴（アクティビティ・お知らせ）を読み込み直す。 */
export function invalidateApplications(): void {
    invalidate("applications");
    invalidate("activity");
}
