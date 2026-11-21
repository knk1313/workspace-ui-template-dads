import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

// API の読み込み状態を、全画面で同じ形で扱うための小さな仕組み。
//   const list = useQuery(applicationQueries.recent(8));
//   list.data / list.error / list.isLoading / list.reload()
// キーと読み込む関数の組（QueryDef）は、各 API のファイル（src/api/applications.ts など）で定義し、画面はそれを渡すだけにする。
// 読み込み方を変えたときに、画面ごとにキーを直さずに済み、同じキーで別の結果が混ざらないようにするため。
// - 読み込んだ結果はキーごとに保持し、画面を移って戻ったときは読み込み中を出さずにすぐ表示する（裏で読み込み直す）。
// - 更新系の操作のあとに invalidate("applications") を呼ぶと、そのキーで始まる結果を読み込み直す。
// - 読み込み直しが失敗しても、前の結果は消さずに表示を続ける（エラーは error で分かる）。
// - 通信中に setQueryData や invalidate をしたら、その通信の結果は古いものとして捨てる（楽観的な更新を古い結果で戻さないため）。
// - どの画面も表示していない結果は、IDLE_CACHE_MAX 件を超えたら古いものから消す（開いた詳細画面の分だけメモリが増え続けないため）。
// 更新系の操作（保存・削除・承認など）は、API を直接呼ばずに useMutation を通す。
// 通信中は pending をボタンの loading に渡し、二度押しで二重に送らないようにする。

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
/** キーごとの、いま表示している画面の数。0 のキーは、上限を超えたときに古いものから消す。 */
const watchers = new Map<string, number>();
/** 使われなくなった順に並べたキー（Map は入れた順を保つ）。 */
const idle = new Map<string, true>();
/** 表示していない結果を保つ上限。超えたら古いものから消す（詳細画面を開くたびに結果が増え続けないように）。 */
export const IDLE_CACHE_MAX = 30;

function watch(key: string): () => void {
    watchers.set(key, (watchers.get(key) ?? 0) + 1);
    idle.delete(key);
    return () => {
        const count = (watchers.get(key) ?? 1) - 1;
        if (count > 0) {
            watchers.set(key, count);
            return;
        }
        watchers.delete(key);
        idle.set(key, true);
        while (idle.size > IDLE_CACHE_MAX) {
            const oldest = idle.keys().next().value!;
            idle.delete(oldest);
            if (!inflight.has(oldest)) {
                cache.delete(oldest);
                generations.delete(oldest);
            }
        }
    };
}

/** キーごとの世代。setQueryData と invalidate で進め、通信を始めたときと違えば、その結果を捨てる。 */
const generations = new Map<string, number>();

function generationOf(key: string): number {
    return generations.get(key) ?? 0;
}

function bumpGeneration(key: string): void {
    generations.set(key, generationOf(key) + 1);
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function setEntry(key: string, entry: Entry) {
    cache.set(key, entry);
    for (const listener of listeners) listener();
}

function keyOf(query: QueryDef<unknown> | string): string {
    return typeof query === "string" ? query : query.key;
}

function toError(e: unknown): Error {
    return e instanceof Error ? e : new Error(String(e));
}

function fetchQuery(key: string, fetcher: () => Promise<unknown>): Promise<void> {
    const running = inflight.get(key);
    if (running) return running;
    const prev = cache.get(key);
    const generation = generationOf(key);
    setEntry(key, { data: prev?.data, error: undefined, fetching: true, stale: false });
    const settle = (next: Pick<Entry, "data" | "error">) => {
        // 先に通信中の印を消す（このあとの setEntry で読み込み直しが始まったとき、終わった通信にまとめられないように）
        inflight.delete(key);
        const current = cache.get(key);
        if (generationOf(key) !== generation) {
            // 通信中に書き換えられた（楽観的な更新）か、読み込み直しを頼まれた（invalidate）。
            // この結果は古いので捨て、今の内容を残す。invalidate されていれば stale のままなので、すぐ読み込み直す。
            setEntry(key, { data: current?.data, error: current?.error, fetching: false, stale: !!current?.stale });
            return;
        }
        setEntry(key, { ...next, fetching: false, stale: false });
    };
    const promise = fetcher()
        .then(
            (data) => settle({ data }),
            (e: unknown) => settle({ data: cache.get(key)?.data, error: toError(e) }),
        );
    inflight.set(key, promise);
    return promise;
}

/** 読み込みのキーと、読み込む関数の組。各 API のファイルで作る。 */
export type QueryDef<T> = {
    key: string;
    fetcher: () => Promise<T>;
};

/** キーと関数の組を作る（型を付けるための小さなヘルパー）。 */
export function defineQuery<T>(key: string, fetcher: () => Promise<T>): QueryDef<T> {
    return { key, fetcher };
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

export function useQuery<T>(query: QueryDef<T>): QueryResult<T>;
export function useQuery<T>(key: string, fetcher: () => Promise<T>): QueryResult<T>;
export function useQuery<T>(queryOrKey: QueryDef<T> | string, fetcherArg?: () => Promise<T>): QueryResult<T> {
    const key = typeof queryOrKey === "string" ? queryOrKey : queryOrKey.key;
    const fetcher = typeof queryOrKey === "string" ? fetcherArg! : queryOrKey.fetcher;
    const entry = useSyncExternalStore(subscribe, () => cache.get(key));
    // fetcher は呼び出し側で毎回作り直されてもよいように ref で持つ（作り直しのたびに通信しないため）
    const fetcherRef = useRef(fetcher);
    useEffect(() => {
        fetcherRef.current = fetcher;
    });

    // 画面を開いたとき（キーが変わったとき）は、前の結果を表示したまま裏で読み込み直す（stale-while-revalidate）
    useEffect(() => {
        const unwatch = watch(key);
        void fetchQuery(key, () => fetcherRef.current());
        return unwatch;
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
        if (key === prefix || key.startsWith(`${prefix}/`)) {
            bumpGeneration(key);
            setEntry(key, { ...entry, stale: true });
        }
    }
}

/** 保持している結果を返す（まだ読み込んでいなければ undefined）。 */
export function getQueryData<T>(query: QueryDef<T> | string): T | undefined {
    return cache.get(keyOf(query))?.data as T | undefined;
}

/** 保持している結果を書き換える（楽観的な更新。通信の結果を待たずに画面へ反映する）。 */
export function setQueryData<T>(query: QueryDef<T> | string, update: (prev: T | undefined) => T): void {
    const key = keyOf(query);
    const entry = cache.get(key);
    bumpGeneration(key);
    setEntry(key, { fetching: false, stale: false, ...entry, data: update(entry?.data as T | undefined) });
}

/** 保持している結果をすべて消す（単体テストで、テストごとに状態をそろえるために使う）。 */
export function clearQueryCache(): void {
    cache.clear();
    inflight.clear();
    generations.clear();
    watchers.clear();
    idle.clear();
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
