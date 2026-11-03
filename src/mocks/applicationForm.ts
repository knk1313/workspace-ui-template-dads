// 申請フォーム用の架空データ。実在の組織・人物とは関係ありません。
// 一覧のモック（applications.ts）にない連絡先などを、編集画面の初期値として補う。

import type { Application } from "@/api/applicationTypes";
import { APPLICATIONS } from "./applications";

export type ApplicationContact = {
    email: string;
    phone: string;
    /** 希望日（"YYYY-MM-DD"）。 */
    desiredDate: string;
};

function pad(n: number, len: number): string {
    return String(n).padStart(len, "0");
}

function addDaysIso(base: Date, days: number): string {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + days);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}-${pad(d.getDate(), 2)}`;
}

/**
 * 申請の連絡先と希望日。id から決定的に作る（テストや画面の表示を毎回同じにするため）。
 * 電話番号は、実在の番号に当たらないよう「000-0000-」で始める（日本には架空用の番号がないため）。
 * 希望日は「今日から 14 日後」にする（固定の日付だと日がたつと過去になり、編集画面の初期値が検証で落ちるため）。
 */
export function findApplicationContact(application: Application, now: Date = new Date()): ApplicationContact {
    const n = Number(application.id.replace(/\D/g, "")) || 0;
    return {
        email: `applicant${pad(n, 3)}@example.jp`,
        phone: n % 3 === 0 ? "" : `000-0000-${pad(1000 + n, 4)}`,
        desiredDate: addDaysIso(now, 14),
    };
}

/**
 * 既存の添付ファイル（名前とサイズだけのモック）を、FileUpload で扱える File にする。
 * フォームで受け付ける PDF・画像だけを引き継ぐ（Excel などは旧様式で受け付けた想定で、編集画面では扱わない）。
 */
export function toMockFiles(attachments: Application["attachments"]): File[] {
    return attachments.flatMap((a) => {
        const type = /\.pdf$/i.test(a.name) ? "application/pdf" : /\.png$/i.test(a.name) ? "image/png" : /\.jpe?g$/i.test(a.name) ? "image/jpeg" : null;
        return type ? [new File([new Uint8Array(a.size)], a.name, { type, lastModified: 0 })] : [];
    });
}

let issued = 0;

/** 新規申請の受付番号を払い出す（モック。既存の最後の番号の続きから振る）。 */
export function issueReceiptNumber(): string {
    issued += 1;
    return `R08-${pad(1000 + (APPLICATIONS.length - 1 + issued) * 3, 6)}`;
}
