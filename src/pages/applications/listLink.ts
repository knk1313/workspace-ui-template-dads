// 一覧 → 詳細 → 編集 と移るときに、履歴の state で引き継ぐ一覧の絞り込みの条件。
// 詳細や編集のパンくずの「申請一覧」から、同じ条件の一覧に戻れるようにするため。

/** listSearch は "?q=..." の形（条件がなければ ""）。 */
export type ListLinkState = { listSearch?: string } | null;

/** 一覧へ戻るリンクの先。 */
export function listHrefOf(state: ListLinkState): string {
    return `/applications${state?.listSearch ?? ""}`;
}
