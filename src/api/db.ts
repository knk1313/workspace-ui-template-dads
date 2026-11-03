// ダミーのデータベース。機能ごとに defineStore でデータの入れ物を作る（src/api/applications.ts、src/api/settings.ts）。
// ページを移っても内容を保ち、再読み込みすると初期値に戻る。機能を消すときは、その機能の API のファイルだけを消せばよい。

const resets: (() => void)[] = [];

/** 初期値を作る関数から、データの入れ物を作る。返した入れ物の中身を直接書き換えてよい。 */
export function defineStore<T extends object>(init: () => T): T {
    const store = init();
    resets.push(() => {
        for (const key of Object.keys(store)) delete (store as Record<string, unknown>)[key];
        Object.assign(store, init());
    });
    return store;
}

/** すべての入れ物を初期値に戻す（単体テストで、テストごとにデータをそろえるために使う）。 */
export function resetStores(): void {
    for (const reset of resets) reset();
}
