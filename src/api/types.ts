// 設定の API とやり取りするデータの型。
// 実際の API に置き換えるときも、この型（API の契約）は残し、API の応答に合わせて直す。

/** 設定画面のプロフィール。 */
export type Profile = {
    name: string;
    email: string;
    department: string;
    bio: string;
    /** プロフィール画像の URL。未設定なら undefined（頭文字のアバターを出す）。 */
    imageUrl?: string;
};

/** ログインしている職員。 */
export type CurrentUser = {
    id: string;
    name: string;
    email: string;
    department: string;
    /** 権限の名前（管理者など）。 */
    role: string;
    imageUrl?: string;
};

/** 通知の設定。 */
export type NotificationSettings = {
    onSubmitted: boolean;
    onReturned: boolean;
    weeklyDigest: boolean;
    channels: { email: boolean; inApp: boolean };
};
