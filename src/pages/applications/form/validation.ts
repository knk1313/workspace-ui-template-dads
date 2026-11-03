import type { ApplicationCategory } from "@/api/types";

// 申請フォームの入力値と検証（純粋関数）。画面から切り離して単体テストできるようにする。
// DADS のバリデーション方針: 送信時にまとめて検証し、入力中やフォーカスアウトではエラーを出さない。
// エラーテキストは「＊」で始め、何をどう直せばよいかを書く。

export type ApplicationFormValues = {
    title: string;
    /** 未選択は ""。 */
    category: ApplicationCategory | "";
    /** 入力されたままの文字列（全角数字・カンマ・「円」を含んでよい）。 */
    amount: string;
    applicant: string;
    organization: string;
    email: string;
    phone: string;
    /** "YYYY-MM-DD" または ""。 */
    desiredDate: string;
    assignee: string;
    priority: boolean;
    attachments: File[];
    memo: string;
    agreed: boolean;
};

/** フィールド名。エラー一覧の順番（= フォームの並び順）にも使う。 */
export type FieldName = keyof ApplicationFormValues;

export type FieldError = { field: FieldName; message: string };

export const TITLE_MAX = 40;
export const MEMO_MAX = 400;
/** 申請額の上限（円）。架空の制度の上限。 */
export const AMOUNT_MAX = 100_000_000;
/** 添付ファイル 1 件あたりの上限（10 MB）。 */
export const FILE_SIZE_MAX = 10 * 1024 * 1024;
export const ACCEPTED_FILE_TYPES = "application/pdf,image/jpeg,image/png";

const FIELD_ORDER: FieldName[] = [
    "title",
    "category",
    "amount",
    "applicant",
    "organization",
    "email",
    "phone",
    "desiredDate",
    "assignee",
    "priority",
    "attachments",
    "memo",
    "agreed",
];

export const EMPTY_VALUES: ApplicationFormValues = {
    title: "",
    category: "",
    amount: "",
    applicant: "",
    organization: "",
    email: "",
    phone: "",
    desiredDate: "",
    assignee: "",
    priority: false,
    attachments: [],
    memo: "",
    agreed: false,
};

/** 申請額が必須の種別。 */
export function requiresAmount(category: ApplicationFormValues["category"]): boolean {
    return category === "subsidy" || category === "permit";
}

/** 添付ファイルが必須の種別。 */
export function requiresAttachment(category: ApplicationFormValues["category"]): boolean {
    return category === "subsidy";
}

function toHalfWidthDigits(text: string): string {
    return text.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
}

/**
 * 申請額の入力を数値に正規化する。全角数字、カンマ（, ，）、空白、末尾の「円」を受け付ける。
 * 空欄は null、数値として解釈できないものは NaN を返す。
 */
export function normalizeAmount(text: string): number | null {
    const cleaned = toHalfWidthDigits(text)
        .replace(/[,，\s\u3000]/g, "")
        .replace(/円$/, "");
    if (cleaned === "") return null;
    if (!/^\d+$/.test(cleaned)) return Number.NaN;
    return Number(cleaned);
}

/** 文字数（サロゲートペアを 1 文字として数える。Textarea のカウンターと揃える）。 */
export function countChars(text: string): number {
    return Array.from(text).length;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(text: string): boolean {
    return EMAIL_PATTERN.test(text.trim());
}

/** 電話番号は数字とハイフン（全角も可）で、数字が 10〜11 桁。 */
export function isValidPhone(text: string): boolean {
    const half = toHalfWidthDigits(text).replace(/[－ー‐]/g, "-").trim();
    if (!/^[\d-]+$/.test(half)) return false;
    const digits = half.replace(/-/g, "");
    return digits.length >= 10 && digits.length <= 11;
}

/** ローカル時刻での今日（"YYYY-MM-DD"）。 */
export function todayIso(now: Date = new Date()): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function isAcceptedFile(file: File): boolean {
    if (file.type) return ACCEPTED_FILE_TYPES.split(",").includes(file.type);
    // type が取れない環境では拡張子で判定する
    return /\.(pdf|jpe?g|png)$/i.test(file.name);
}

/**
 * 入力値を検証し、エラーをフォームの並び順で返す。エラーがなければ空配列。
 * today は "YYYY-MM-DD"（テストで日付を固定できるよう引数で受け取る）。
 */
export function validateApplicationForm(values: ApplicationFormValues, today: string = todayIso()): FieldError[] {
    const errors: Partial<Record<FieldName, string>> = {};

    const title = values.title.trim();
    if (title === "") errors.title = "件名を入力してください";
    else if (countChars(title) > TITLE_MAX) errors.title = `件名を ${TITLE_MAX} 文字以内で入力してください（現在 ${countChars(title)} 文字）`;

    if (values.category === "") errors.category = "種別を選択してください";

    const amount = normalizeAmount(values.amount);
    if (amount === null) {
        if (requiresAmount(values.category)) errors.amount = "補助金・許認可の申請では申請額を円単位で入力してください";
    } else if (Number.isNaN(amount)) {
        errors.amount = "申請額は数字だけで入力してください（例: 1200000 または 1,200,000）";
    } else if (amount <= 0) {
        errors.amount = "申請額は 1 円以上で入力してください";
    } else if (amount > AMOUNT_MAX) {
        errors.amount = `申請額は ${AMOUNT_MAX.toLocaleString("ja-JP")} 円以下で入力してください`;
    }

    if (values.applicant.trim() === "") errors.applicant = "氏名を入力してください";

    const email = values.email.trim();
    if (email === "") errors.email = "メールアドレスを入力してください";
    else if (!isValidEmail(email)) errors.email = "メールアドレスを「name@example.jp」のように、@ とドメインを含めて入力してください";

    if (values.phone.trim() !== "" && !isValidPhone(values.phone)) {
        errors.phone = "電話番号は数字とハイフンで、市外局番から入力してください（例: 03-1234-5678）";
    }

    if (values.desiredDate === "") errors.desiredDate = "希望日を西暦の年月日で入力してください（例: 2026-12-01）";
    else if (values.desiredDate < today) errors.desiredDate = `希望日は今日（${today}）以降の日付を入力してください`;

    const rejected = values.attachments.filter((f) => !isAcceptedFile(f));
    const oversized = values.attachments.filter((f) => isAcceptedFile(f) && f.size > FILE_SIZE_MAX);
    if (rejected.length > 0) {
        errors.attachments = `PDF・JPEG・PNG 以外のファイルは添付できません。「${rejected.map((f) => f.name).join("」「")}」を削除してください`;
    } else if (oversized.length > 0) {
        errors.attachments = `1 ファイル 10 MB 以下にしてください。「${oversized.map((f) => f.name).join("」「")}」を削除するか、容量を減らしてから添付し直してください`;
    } else if (values.attachments.length === 0 && requiresAttachment(values.category)) {
        errors.attachments = "補助金の申請では申請書（PDF）を添付してください";
    }

    if (countChars(values.memo) > MEMO_MAX) {
        errors.memo = `メモを ${MEMO_MAX} 文字以内にしてください（${countChars(values.memo) - MEMO_MAX} 文字超過）`;
    }

    if (!values.agreed) errors.agreed = "内容を確認のうえ、「記載内容に誤りがないことを確認しました」にチェックを入れてください";

    return FIELD_ORDER.flatMap((field) => (errors[field] ? [{ field, message: errors[field] }] : []));
}

/** 確認画面などに出す申請額の表示（例: 1,200,000 円）。未入力は undefined。 */
export function formatAmount(text: string): string | undefined {
    const amount = normalizeAmount(text);
    if (amount === null || Number.isNaN(amount)) return undefined;
    return `${amount.toLocaleString("ja-JP")} 円`;
}
