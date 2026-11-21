// 設定の API（ダミー）。

import { NOTIFICATION_SETTINGS, PROFILE } from "@/mocks/settings";
import { defineStore } from "./db";
import { mockRequest } from "./mock";
import { defineQuery } from "./query";
import type { NotificationSettings, Profile } from "./types";

const db = defineStore(() => ({
    profile: { name: PROFILE.name, email: PROFILE.email, department: PROFILE.department, bio: PROFILE.bio } as Profile,
    notifications: structuredClone(NOTIFICATION_SETTINGS) as NotificationSettings,
}));

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

/** 画面が useQuery に渡す、読み込みのキーと関数の組。 */
export const settingsQueries = {
    profile: defineQuery("settings/profile", getProfile),
    notifications: defineQuery("settings/notifications", getNotificationSettings),
};
