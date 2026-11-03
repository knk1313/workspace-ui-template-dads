// 設定の API とやり取りするデータの型。
// 実際の API に置き換えるときも、この型（API の契約）は残し、API の応答に合わせて直す。

/** 設定画面のプロフィール。 */
export type Profile = { name: string; email: string; department: string; bio: string };

/** 通知の設定。 */
export type NotificationSettings = {
    onSubmitted: boolean;
    onReturned: boolean;
    weeklyDigest: boolean;
    channels: { email: boolean; inApp: boolean };
};
