// 申請の連絡先と希望日の架空データ。実在の組織・人物とは関係ありません。
// 初期データ（applications.ts）を作るときに使う。


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
export function findApplicationContact(id: string, now: Date = new Date()): ApplicationContact {
    const n = Number(id.replace(/\D/g, "")) || 0;
    return {
        email: `applicant${pad(n, 3)}@example.jp`,
        phone: n % 3 === 0 ? "" : `000-0000-${pad(1000 + n, 4)}`,
        desiredDate: addDaysIso(now, 14),
    };
}
