import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

// API の読み込み状態を、全画面で同じ形で扱うための小さな仕組み。
//   const list = useQuery("applications", listApplications);
//   list.data / list.error / list.isLoading / list.reload()
// - 読み込んだ結果はキーごとに保持し、画面を移って戻ったときは読み込み中を出さずにすぐ表示する（裏で読み込み直す）。
// - 更新系の操作のあとに invalidate("applications") を呼ぶと、そのキーで始まる結果を読み込み直す。
// - 読み込み直しが失敗しても、前の結果は消さずに表示を続ける（エラーは error で分かる）。

type Entry = {
    data?: unknown;
    error?: Error;
    /** 通信中。 */
    fetching: boolean;
    /** 読み込み直しが必要（invalidate された）。 */
    stale: boolean;
};

const cache = new Map<string, Entry>();
const listeners = new Set<() => void>();
const inflight = new Map<string, Promise<void>>();

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function setEntry(key: string, entry: Entry) {
    cache.set(key, entry);
    for (const listener of listeners) listener();
}

function toError(e: unknown): Error {
    return e instanceof Error ? e : new Error(String(e));
}

function fetchQuery(key: string, fetcher: () => Promise<unknown>): Promise<void> {
    const running = inflight.get(key);
    if (running) return running;
    const prev = cache.get(key);
    setEntry(key, { data: prev?.data, error: undefined, fetching: true, stale: false });
    const promise = fetcher()
        .then(
            (data) => setEntry(key, { data, fetching: false, stale: false }),
            (e: unknown) => setEntry(key, { data: prev?.data, error: toError(e), fetching: false, stale: false }),
        )
        .finally(() => inflight.delete(key));
    inflight.set(key, promise);
    return promise;
}

export type QueryResult<T> = {
    data: T | undefined;
    error: Error | undefined;
    /** まだ一度も読み込めていない（表示するデータがない）通信中。スケルトンを出す。 */
    isLoading: boolean;
    /** データを表示したまま、裏で読み込み直している。 */
    isRefreshing: boolean;
    reload: () => Promise<void>;
};

export function useQuery<T>(key: string, fetcher: () => Promise<T>): QueryResult<T> {
    const entry = useSyncExternalStore(subscribe, () => cache.get(key));
    // fetcher は呼び出し側で毎回作り直されてもよいように ref で持つ（作り直しのたびに通信しないため）
    const fetcherRef = useRef(fetcher);
    useEffect(() => {
        fetcherRef.current = fetcher;
    });

    // 画面を開いたとき（キーが変わったとき）は、前の結果を表示したまま裏で読み込み直す（stale-while-revalidate）
    useEffect(() => {
        void fetchQuery(key, () => fetcherRef.current());
    }, [key]);

    // invalidate されたら読み込み直す（通信中の重複は fetchQuery がまとめる）
    const stale = !!entry?.stale && !entry.fetching;
    useEffect(() => {
        if (stale) void fetchQuery(key, () => fetcherRef.current());
    }, [key, stale]);

    const reload = useCallback(() => fetchQuery(key, () => fetcherRef.current()), [key]);

    const hasData = entry?.data !== undefined;
    return {
        data: entry?.data as T | undefined,
        error: entry?.error,
        isLoading: !hasData && !entry?.error,
        isRefreshing: hasData && !!entry?.fetching,
        reload,
    };
}

/** key で始まる結果を「読み込み直しが必要」にする。表示中の画面はすぐ読み込み直し、ほかの画面は次に開いたときに読み込み直す。 */
export function invalidate(prefix: string): void {
    for (const [key, entry] of cache) {
        if (key === prefix || key.startsWith(`${prefix}/`)) setEntry(key, { ...entry, stale: true });
    }
}

/** 保持している結果を書き換える（楽観的な更新。通信の結果を待たずに画面へ反映する）。 */
export function setQueryData<T>(key: string, update: (prev: T | undefined) => T): void {
    const entry = cache.get(key);
    setEntry(key, { fetching: false, stale: false, ...entry, data: update(entry?.data as T | undefined) });
}

/** 保持している結果をすべて消す（単体テストで、テストごとに状態をそろえるために使う）。 */
export function clearQueryCache(): void {
    cache.clear();
    inflight.clear();
}

export type MutationResult<A extends unknown[], R> = {
    /** 実行する。失敗したときは例外を投げる（呼び出し側でトーストなどを出す）。 */
    run: (...args: A) => Promise<R>;
    /** 実行中。ボタンの loading に渡す。 */
    pending: boolean;
};

/** 更新系の操作。実行中の状態を持つ（二重送信を防ぎ、ボタンに処理中を出すため）。 */
export function useMutation<A extends unknown[], R>(fn: (...args: A) => Promise<R>): MutationResult<A, R> {
    const [pending, setPending] = useState(false);
    const run = useCallback(
        async (...args: A) => {
            setPending(true);
            try {
                return await fn(...args);
            } finally {
                setPending(false);
            }
        },
        [fn],
    );
    return { run, pending };
}
