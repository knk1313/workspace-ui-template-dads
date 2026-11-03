// ダミーのデータベース。ページを移っても内容を保つ（再読み込みすると初期値に戻る）。
// src/mocks/ の架空データを初期値にする。

import { RECENT_ACTIVITY } from "@/mocks/activity";
import { generateApplications } from "@/mocks/applications";
import { NOTIFICATION_SETTINGS, PROFILE } from "@/mocks/settings";
import type { ActivityItem, Application, NotificationSettings, Profile } from "./types";

type Db = {
    applications: Application[];
    activity: ActivityItem[];
    /** 差戻しの理由（申請 id ごと）。 */
    returnReasons: Record<string, string>;
    profile: Profile;
    notifications: NotificationSettings;
    /** 払い出した受付番号の数。 */
    issued: number;
};

function initialDb(): Db {
    return {
        applications: generateApplications(),
        activity: structuredClone(RECENT_ACTIVITY),
        returnReasons: {},
        profile: { name: PROFILE.name, email: PROFILE.email, department: PROFILE.department, bio: PROFILE.bio },
        notifications: structuredClone(NOTIFICATION_SETTINGS),
        issued: 0,
    };
}

export let db: Db = initialDb();

/** 初期値に戻す（単体テストで、テストごとにデータをそろえるために使う）。 */
export function resetDb(): void {
    db = initialDb();
}
