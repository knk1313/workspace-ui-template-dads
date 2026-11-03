// 設定の API（ダミー）。

import { db } from "./db";
import { mockRequest } from "./mock";
import type { NotificationSettings, Profile } from "./types";

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
