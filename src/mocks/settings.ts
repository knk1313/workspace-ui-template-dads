// 設定画面・ログイン画面の架空データ。実在の組織・連絡先とは関係ありません。

/** ログインしている職員（架空）。 */
export const CURRENT_USER = {
    id: "u-001",
    name: "佐藤 花子",
    email: "sato.hanako@example.jp",
    department: "デジタル推進課",
    role: "管理者",
};

/** 所属の選択肢。 */
export const DEPARTMENTS = ["デジタル推進課", "総務課", "財政課", "市民課", "産業振興課", "都市計画課"] as const;

/** 設定画面のプロフィールの初期値。 */
export const PROFILE = {
    name: CURRENT_USER.name,
    email: CURRENT_USER.email,
    department: CURRENT_USER.department,
    bio: "申請の受付と審査の取りまとめを担当しています（架空のプロフィールです）。",
};

/** 通知設定の初期値。 */
export const NOTIFICATION_SETTINGS = {
    onSubmitted: true,
    onReturned: true,
    weeklyDigest: false,
    channels: { email: true, inApp: true },
};

/** 表示例に使う日時（ISO 8601）。 */
export const SAMPLE_DATETIME = "2026-10-24T09:30:00Z";

/** ログイン画面の検証用。このメールアドレスでログインすると認証失敗として扱う。 */
export const LOGIN_FAILURE_EMAIL = "fail@example.jp";

/** 500 エラー画面に出す問い合わせ先（架空）。 */
export const SUPPORT_CONTACT = {
    name: "申請管理システムのヘルプデスク",
    phone: "000-0000-0000",
    hours: "平日9時〜17時",
};
