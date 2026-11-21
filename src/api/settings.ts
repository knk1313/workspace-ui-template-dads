// 設定の API（ダミー）。

import { CURRENT_USER, DEPARTMENTS, NOTIFICATION_SETTINGS, PROFILE } from "@/mocks/settings";
import { defineStore } from "./db";
import { mockRequest } from "./mock";
import { defineQuery } from "./query";
import type { CurrentUser, NotificationSettings, Profile } from "./types";

const db = defineStore(() => ({
    profile: { name: PROFILE.name, email: PROFILE.email, department: PROFILE.department, bio: PROFILE.bio } as Profile,
    notifications: structuredClone(NOTIFICATION_SETTINGS) as NotificationSettings,
}));

/**
 * ログインしている職員（ダミーの API の中だけで使う）。名前・メールアドレス・所属・画像はプロフィールの設定と同じにする。
 * 利用者の名前の出どころを一つにするため（プロフィールを保存すると、ヘッダーと操作履歴の名前も変わる）。
 */
export function currentProfile(): CurrentUser {
    const { name, email, department, imageUrl } = db.profile;
    return { id: CURRENT_USER.id, role: CURRENT_USER.role, name, email, department, imageUrl };
}

export function getProfile(): Promise<Profile> {
    return mockRequest(() => db.profile);
}

/**
 * プロフィールを保存する。image を渡すと、プロフィール画像も差し替える（渡さなければ今の画像のまま）。
 * ダミーでは、画像をブラウザーの中の URL（createObjectURL）にして持つ。再読み込みすると消える。
 */
export function saveProfile(profile: Omit<Profile, "imageUrl">, image?: File): Promise<Profile> {
    return mockRequest(() => {
        let imageUrl = db.profile.imageUrl;
        if (image) imageUrl = typeof URL.createObjectURL === "function" ? URL.createObjectURL(image) : `mock-image:${image.name}`;
        return (db.profile = { ...profile, imageUrl });
    });
}

export function getNotificationSettings(): Promise<NotificationSettings> {
    return mockRequest(() => db.notifications);
}

export function saveNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
    return mockRequest(() => (db.notifications = structuredClone(settings)));
}

/** プロフィールの「所属」に選べる部署の一覧。 */
export function listDepartments(): Promise<string[]> {
    return mockRequest(() => [...DEPARTMENTS]);
}

/** 画面が useQuery に渡す、読み込みのキーと関数の組。 */
export const settingsQueries = {
    departments: defineQuery("settings/departments", listDepartments),
    profile: defineQuery("settings/profile", getProfile),
    notifications: defineQuery("settings/notifications", getNotificationSettings),
};
