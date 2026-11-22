// 認証とログインしている職員の API（ダミー）。画面はこの関数だけを通してログインと利用者の情報を扱う。
// 実際の API に置き換えるときは、各関数の中身を認証の API の呼び出しに差し替える（戻り値の型は変えない）。
// ログインしていないときに画面へ入らせない仕組みは AppLayout にある（getCurrentUser が null ならログイン画面へ移す）。
//
// 見本では、ログインしていることを示す印だけをブラウザーに保存する。画面を分けるための見本で、データを守るものではない。
// 実際のアプリでは、認証の結果をサーバーが持ち、API の側でも必ず権限を確かめる。

import { LOGIN_FAILURE_EMAIL } from "@/mocks/settings";
import { readStored, writeStored } from "@/lib/storage";
import { defineStore } from "./db";
import { mockRequest } from "./mock";
import { defineQuery, invalidate } from "./query";
import { currentProfile } from "./settings";
import type { CurrentUser } from "./types";

export const SESSION_STORAGE_KEY = "mock-session";

/** 印を保存できない環境（プライベートブラウズなど）では、再読み込みするまでログインしたままにする。 */
const session = defineStore(() => ({ loggedIn: false }));

function hasSession(): boolean {
    const parse = (raw: string) => raw === "1" || undefined;
    return session.loggedIn || readStored(SESSION_STORAGE_KEY, parse, false, "session") || readStored(SESSION_STORAGE_KEY, parse, false, "local");
}

function startSession(remember: boolean): void {
    session.loggedIn = true;
    // 「ログイン状態を保持する」を選ばなければ、タブを閉じるまでにする
    writeStored(SESSION_STORAGE_KEY, "1", remember ? "local" : "session");
}

function endSession(): void {
    session.loggedIn = false;
    writeStored(SESSION_STORAGE_KEY, null, "session");
    writeStored(SESSION_STORAGE_KEY, null, "local");
}

export type LoginInput = { email: string; password: string; remember: boolean };

/**
 * ログインする。メールアドレスかパスワードが違うときは null を返す（画面で「違います」のバナーを出す）。
 * 通信に失敗したときは ApiError を投げる。
 * 見本では、LOGIN_FAILURE_EMAIL（fail@example.jp）のときだけ失敗として扱う。
 */
export function login({ email, remember }: LoginInput): Promise<CurrentUser | null> {
    return mockRequest(() => {
        if (email.trim().toLowerCase() === LOGIN_FAILURE_EMAIL) return null;
        startSession(remember);
        return currentProfile();
    });
}

export function logout(): Promise<void> {
    return mockRequest(endSession);
}

/**
 * ログインしている職員。ログインしていなければ null。名前と画像はプロフィールの設定と同じものを返す。
 * 「通信を失敗させる」の対象にしない（再読み込みしたときにどの画面も開けず、設定を戻せなくなるため）。
 */
export function getCurrentUser(): Promise<CurrentUser | null> {
    return mockRequest(() => (hasSession() ? currentProfile() : null), { canFail: false });
}

/** 画面が useQuery に渡す、読み込みのキーと関数の組。 */
export const authQueries = {
    me: defineQuery("auth/me", getCurrentUser),
};

/** プロフィールを変えたあとに呼ぶ。ヘッダーの利用者の名前などを読み込み直す。 */
export function invalidateCurrentUser(): void {
    invalidate("auth");
}
