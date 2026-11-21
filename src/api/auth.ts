// 認証とログインしている職員の API（ダミー）。画面はこの関数だけを通してログインと利用者の情報を扱う。
// 実際の API に置き換えるときは、各関数の中身を認証の API の呼び出しに差し替える（戻り値の型は変えない）。
// ログインしていないときに画面へ入らせない仕組み（ルートの保護）は、テンプレートでは置いていない。
// 入れるときは、AppLayout で useQuery(authQueries.me) の結果を見て、ログインしていなければ /login へ移す。

import { LOGIN_FAILURE_EMAIL } from "@/mocks/settings";
import { mockRequest } from "./mock";
import { defineQuery, invalidate } from "./query";
import { currentProfile } from "./settings";
import type { CurrentUser } from "./types";

export type LoginInput = { email: string; password: string; remember: boolean };

/**
 * ログインする。メールアドレスかパスワードが違うときは null を返す（画面で「違います」のバナーを出す）。
 * 通信に失敗したときは ApiError を投げる。
 * 見本では、LOGIN_FAILURE_EMAIL（fail@example.jp）のときだけ失敗として扱う。
 */
export function login({ email }: LoginInput): Promise<CurrentUser | null> {
    return mockRequest(() => (email.trim().toLowerCase() === LOGIN_FAILURE_EMAIL ? null : currentProfile()));
}

export function logout(): Promise<void> {
    return mockRequest(() => undefined);
}

/** ログインしている職員。名前と画像はプロフィールの設定と同じものを返す。 */
export function getCurrentUser(): Promise<CurrentUser> {
    return mockRequest(() => currentProfile());
}

/** 画面が useQuery に渡す、読み込みのキーと関数の組。 */
export const authQueries = {
    me: defineQuery("auth/me", getCurrentUser),
};

/** プロフィールを変えたあとに呼ぶ。ヘッダーの利用者の名前などを読み込み直す。 */
export function invalidateCurrentUser(): void {
    invalidate("auth");
}
