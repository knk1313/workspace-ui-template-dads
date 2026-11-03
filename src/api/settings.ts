// 設定の API（ダミー）。

import { NOTIFICATION_SETTINGS, PROFILE } from "@/mocks/settings";
import { defineStore } from "./db";
import { mockRequest } from "./mock";
import type { NotificationSettings, Profile } from "./types";

const db = defineStore(() => ({
    profile: { name: PROFILE.name, email: PROFILE.email, department: PROFILE.department, bio: PROFILE.bio } as Profile,
    notifications: structuredClone(NOTIFICATION_SETTINGS) as NotificationSettings,
}));

export function getProfile(): Promise<Profile> {
    return mockRequest(() => db.profile);
}

export function saveProfile(profile: Profile): Promise<Profile> {
    return mockRequest(() => (db.profile = { ...profile }));
}

export function getNotificationSettings(): Promise<NotificationSettings> {
    return mockRequest(() => db.notifications);
}

export function saveNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
    return mockRequest(() => (db.notifications = structuredClone(settings)));
}
