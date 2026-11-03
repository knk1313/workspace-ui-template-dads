import type { FieldName } from "./validation";

// 各項目の id と項目名。エラー一覧のリンク先・確認画面の項目名・入力画面のラベルで同じものを使う。

export const FIELD_LABELS: Record<FieldName, string> = {
    title: "件名",
    category: "種別",
    amount: "申請額",
    applicant: "氏名",
    organization: "所属",
    email: "メールアドレス",
    phone: "電話番号",
    desiredDate: "希望日",
    assignee: "担当者",
    priority: "優先対応",
    attachments: "添付ファイル",
    memo: "メモ",
    agreed: "確認事項",
};

/** 入力部品の id。ラジオ・チェックボックスは先頭の input の id。 */
export function fieldId(field: FieldName): string {
    return `application-${field}`;
}

/** エラー一覧のリンクから、該当する入力部品へフォーカスを移す。 */
export function focusField(field: FieldName): void {
    const target =
        field === "category"
            ? // ラジオは選択中のもの、なければ先頭へ（Tab で入ったときと同じ位置）
              (document.querySelector<HTMLInputElement>(`input[name="${fieldId(field)}"]:checked`) ??
              document.querySelector<HTMLInputElement>(`input[name="${fieldId(field)}"]`))
            : document.getElementById(fieldId(field));
    target?.focus();
}
