import { describe, expect, it } from "vitest";
import { EMPTY_VALUES, formatAmount, isValidEmail, isValidPhone, normalizeAmount, validateApplicationForm, type ApplicationFormValues } from "./validation";

const TODAY = "2026-11-03";

const VALID: ApplicationFormValues = {
    ...EMPTY_VALUES,
    title: "商店街活性化事業補助金の申請",
    category: "subsidy",
    amount: "1200000",
    applicant: "山田 太郎",
    email: "yamada@example.jp",
    desiredDate: "2026-12-01",
    attachments: [new File(["%PDF"], "申請書.pdf", { type: "application/pdf" })],
    agreed: true,
};

const fields = (values: ApplicationFormValues) => validateApplicationForm(values, TODAY).map((e) => e.field);
const messageOf = (values: ApplicationFormValues, field: string) => validateApplicationForm(values, TODAY).find((e) => e.field === field)?.message;

describe("validateApplicationForm", () => {
    it("正しい入力ならエラーはない", () => {
        expect(validateApplicationForm(VALID, TODAY)).toEqual([]);
    });

    it("空のときは必須項目のエラーをフォームの並び順で返す", () => {
        expect(fields(EMPTY_VALUES)).toEqual(["title", "category", "applicant", "email", "desiredDate", "agreed"]);
    });

    it("空白だけの入力は未入力として扱う", () => {
        expect(fields({ ...VALID, title: "　 ", applicant: "  " })).toEqual(["title", "applicant"]);
    });

    it("件名は 40 文字まで", () => {
        expect(fields({ ...VALID, title: "あ".repeat(40) })).toEqual([]);
        expect(messageOf({ ...VALID, title: "あ".repeat(41) }, "title")).toContain("40 文字以内");
    });

    it("申請額は補助金・許認可のときだけ必須", () => {
        expect(fields({ ...VALID, amount: "" })).toEqual(["amount"]);
        expect(fields({ ...VALID, category: "permit", amount: "", attachments: [] })).toEqual(["amount"]);
        expect(fields({ ...VALID, category: "certificate", amount: "", attachments: [] })).toEqual([]);
    });

    it("申請額が数字でなければエラー", () => {
        expect(messageOf({ ...VALID, amount: "百万円" }, "amount")).toContain("数字だけ");
        expect(messageOf({ ...VALID, amount: "0" }, "amount")).toContain("1 円以上");
        expect(messageOf({ ...VALID, amount: "1-000" }, "amount")).toContain("数字だけ");
    });

    it("メールアドレスの形式を確かめる", () => {
        expect(messageOf({ ...VALID, email: "yamada" }, "email")).toContain("@");
        expect(messageOf({ ...VALID, email: "yamada@example" }, "email")).toBeDefined();
        expect(messageOf({ ...VALID, email: " yamada@example.jp " }, "email")).toBeUndefined();
    });

    it("電話番号は任意だが、入力したら形式を確かめる", () => {
        expect(fields({ ...VALID, phone: "" })).toEqual([]);
        expect(fields({ ...VALID, phone: "０３－１２３４－５６７８" })).toEqual([]);
        expect(fields({ ...VALID, phone: "123" })).toEqual(["phone"]);
    });

    it("希望日は今日以降", () => {
        expect(fields({ ...VALID, desiredDate: TODAY })).toEqual([]);
        expect(messageOf({ ...VALID, desiredDate: "2026-11-02" }, "desiredDate")).toBe("希望日は今日（2026-11-03）以降の日付を入力してください");
    });

    it("補助金では添付ファイルが必須で、PDF・画像以外は受け付けない", () => {
        expect(messageOf({ ...VALID, attachments: [] }, "attachments")).toContain("添付してください");
        expect(fields({ ...VALID, category: "report", amount: "", attachments: [] })).toEqual([]);
        const xlsx = new File(["x"], "資料.xlsx", { type: "application/vnd.ms-excel" });
        expect(messageOf({ ...VALID, attachments: [xlsx] }, "attachments")).toContain("「資料.xlsx」を削除");
    });

    it("メモは 400 文字まで", () => {
        expect(fields({ ...VALID, memo: "あ".repeat(400) })).toEqual([]);
        expect(messageOf({ ...VALID, memo: "あ".repeat(402) }, "memo")).toContain("2 文字超過");
    });

    it("同意のチェックが必須", () => {
        expect(fields({ ...VALID, agreed: false })).toEqual(["agreed"]);
    });
});

describe("normalizeAmount", () => {
    it("全角数字・カンマ・円を受け付けて数値にする", () => {
        expect(normalizeAmount("1200000")).toBe(1200000);
        expect(normalizeAmount("１，２００，０００")).toBe(1200000);
        expect(normalizeAmount("1,200,000円")).toBe(1200000);
        expect(normalizeAmount(" 50 000 ")).toBe(50000);
    });

    it("空欄は null、数字以外は NaN", () => {
        expect(normalizeAmount("")).toBeNull();
        expect(normalizeAmount("  ")).toBeNull();
        expect(normalizeAmount("12.5")).toBeNaN();
        expect(normalizeAmount("abc")).toBeNaN();
    });

    it("確認画面向けに桁区切りで表示する", () => {
        expect(formatAmount("１２０００００")).toBe("1,200,000 円");
        expect(formatAmount("")).toBeUndefined();
    });
});

describe("isValidEmail / isValidPhone", () => {
    it("メールアドレス", () => {
        expect(isValidEmail("a@b.jp")).toBe(true);
        expect(isValidEmail("a b@c.jp")).toBe(false);
    });

    it("電話番号", () => {
        expect(isValidPhone("090-1234-5678")).toBe(true);
        expect(isValidPhone("0312345678")).toBe(true);
        expect(isValidPhone("03-1234")).toBe(false);
    });
});
