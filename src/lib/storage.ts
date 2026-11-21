// ブラウザーに保存する好み（配色・画面レイアウト・日付の形式など）の読み書き。
// 保存できない環境（プライベートブラウズ、保存を止めた設定など）では例外を投げずに既定値で動く。
// 読んだ値は parse で確かめ、選択肢にない値（古い版の値や手で書き換えた値）は既定値に戻す。

type StorageKind = "local" | "session";

function storageOf(kind: StorageKind): Storage {
    return kind === "local" ? localStorage : sessionStorage;
}

/** key の値を読み、parse で確かめる。ない・読めない・parse が undefined を返したときは fallback。 */
export function readStored<T>(key: string, parse: (raw: string) => T | undefined, fallback: T, kind: StorageKind = "local"): T {
    try {
        const raw = storageOf(kind).getItem(key);
        if (raw === null) return fallback;
        return parse(raw) ?? fallback;
    } catch {
        return fallback;
    }
}

/** key に値を書く。null なら消す。保存できなくても、このタブの間は呼び出し側の状態で反映される。 */
export function writeStored(key: string, value: string | null, kind: StorageKind = "local"): void {
    try {
        if (value === null) storageOf(kind).removeItem(key);
        else storageOf(kind).setItem(key, value);
    } catch {
        // 保存できない環境では何もしない
    }
}

/** JSON として読む parse。読めなければ undefined。 */
export function parseJson(raw: string): unknown {
    try {
        return JSON.parse(raw);
    } catch {
        return undefined;
    }
}
