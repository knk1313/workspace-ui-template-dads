import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router";
import type { SortState } from "@/components/ui/DataTable";
import { CATEGORY_LABELS, STATUS_LABELS, type Application, type ApplicationCategory, type ApplicationStatus } from "@/api/applicationTypes";

// 一覧の検索条件（キーワード・種別・状態・担当者・並べ替え・ページ）を URL の検索パラメータに保存する。
// URL に置くことで、詳細画面から「戻る」で帰ったときや、URL を共有したときに同じ一覧を再現できる。
// 履歴を条件の変更ごとに積むと「戻る」で一覧の中を行き来するだけになるため、replace で書き換える。

export type ApplicationQuery = {
    q: string;
    category: ApplicationCategory | "";
    status: ApplicationStatus | "";
    assignee: string;
    sort: SortState;
    page: number;
};

export type FilterKey = "q" | "category" | "status" | "assignee";

/** 既定の並び順。新しく更新されたものを先に見たいので更新日時の降順にする。 */
export const DEFAULT_SORT: SortState = { key: "updatedAt", direction: "desc" };

const SORT_KEYS = ["number", "title", "applicant", "category", "status", "amount", "assignee", "updatedAt"];

function isKeyOf<T extends string>(record: Record<T, unknown>, value: string | null): value is T {
    return value != null && Object.prototype.hasOwnProperty.call(record, value);
}

function parseSort(value: string | null): SortState {
    if (value == null) return DEFAULT_SORT;
    if (value === "none") return null;
    const [key, direction] = value.split(":");
    if (SORT_KEYS.includes(key) && (direction === "asc" || direction === "desc")) return { key, direction };
    return DEFAULT_SORT;
}

function serializeSort(sort: SortState): string | null {
    if (!sort) return "none";
    if (sort.key === DEFAULT_SORT?.key && sort.direction === DEFAULT_SORT.direction) return null;
    return `${sort.key}:${sort.direction}`;
}

export function parseQuery(params: URLSearchParams): ApplicationQuery {
    const category = params.get("category");
    const status = params.get("status");
    const page = Number(params.get("page"));
    return {
        q: params.get("q") ?? "",
        category: isKeyOf(CATEGORY_LABELS, category) ? category : "",
        status: isKeyOf(STATUS_LABELS, status) ? status : "",
        assignee: params.get("assignee") ?? "",
        sort: parseSort(params.get("sort")),
        page: Number.isInteger(page) && page > 1 ? page : 1,
    };
}

function normalize(text: string): string {
    // 全角英数字を半角に寄せ、大文字小文字を区別せずに部分一致させる（受付番号を全角で入力しても見つかるように）
    return text
        .replace(/[Ａ-Ｚａ-ｚ０-９－]/g, (c) => (c === "－" ? "-" : String.fromCharCode(c.charCodeAt(0) - 0xfee0)))
        .toLocaleLowerCase()
        .trim();
}

/** 検索条件で申請を絞り込む（並べ替えとページ送りは DataTable が行う）。 */
export function filterApplications(rows: Application[], query: ApplicationQuery): Application[] {
    const keyword = normalize(query.q);
    return rows.filter(
        (row) =>
            (!keyword || [row.number, row.title, row.applicant].some((v) => normalize(v).includes(keyword))) &&
            (!query.category || row.category === query.category) &&
            (!query.status || row.status === query.status) &&
            (!query.assignee || row.assignee === query.assignee),
    );
}

export function hasFilters(query: ApplicationQuery): boolean {
    return Boolean(query.q || query.category || query.status || query.assignee);
}

export function useApplicationQuery() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = useMemo(() => parseQuery(searchParams), [searchParams]);

    // setSearchParams は呼び出した時点の URL を元に新しい URL を作るため、同じイベントの中で 2 回呼ぶと
    // 後の呼び出しが前の変更を上書きする（DataTable は並べ替えのあとにページを 1 に戻す）。
    // 書き込んだが URL にまだ反映されていない値をここに持ち、続けて呼ばれたときの土台にする。
    const pending = useRef<URLSearchParams | null>(null);
    useEffect(() => {
        pending.current = null;
    }, [searchParams]);

    const update = useCallback(
        (patch: Partial<Record<FilterKey | "sort" | "page", string | null>>) => {
            const next = new URLSearchParams(pending.current ?? searchParams);
            for (const [key, value] of Object.entries(patch)) {
                if (value) next.set(key, value);
                else next.delete(key);
            }
            pending.current = next;
            setSearchParams(next, { replace: true });
        },
        [searchParams, setSearchParams],
    );

    /** 絞り込み条件を変える。結果の件数が変わるのでページは先頭に戻す。 */
    const setFilter = useCallback((key: FilterKey, value: string) => update({ [key]: value || null, page: null }), [update]);
    const clearFilters = useCallback(() => update({ q: null, category: null, status: null, assignee: null, page: null }), [update]);
    const setSort = useCallback((sort: SortState) => update({ sort: serializeSort(sort), page: null }), [update]);
    const setPage = useCallback((page: number) => update({ page: page > 1 ? String(page) : null }), [update]);

    return { query, search: searchParams.toString(), setFilter, clearFilters, setSort, setPage };
}
