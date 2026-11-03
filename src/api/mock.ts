// ダミー API の土台。画面はこのディレクトリの関数だけを通してデータを読み書きする。
// 実際の API に置き換えるときは、src/api/*.ts の各関数の中身を fetch などに差し替える（画面側は変えなくてよい）。
//
// 見本として、通信の遅延と失敗を起こせる。設定画面の「表示」タブ →「動作の確認」で切り替える（ブラウザのタブを閉じるまで有効）。

/** API が失敗したときに投げるエラー。画面には message をそのまま出せる文にする。 */
export class ApiError extends Error {
    constructor(message = "通信に失敗しました。時間をおいて、もう一度お試しください。") {
        super(message);
        this.name = "ApiError";
    }
}

export type MockOptions = {
    /** すべての通信を失敗させる（エラー表示と再試行の確認用）。 */
    fail: boolean;
    /** 通信を遅くする（読み込み中・保存中の表示の確認用）。 */
    slow: boolean;
};

const STORAGE_KEY = "mock-api-options";
const DEFAULT_OPTIONS: MockOptions = { fail: false, slow: false };

/** 通常の遅延。単体テストでは待たない。 */
const LATENCY_MS = import.meta.env.MODE === "test" ? 0 : 400;
const SLOW_LATENCY_MS = 3000;

export function getMockOptions(): MockOptions {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        return raw ? { ...DEFAULT_OPTIONS, ...(JSON.parse(raw) as Partial<MockOptions>) } : DEFAULT_OPTIONS;
    } catch {
        return DEFAULT_OPTIONS;
    }
}

export function setMockOptions(options: MockOptions): void {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(options));
    } catch {
        // 保存できない環境（プライベートブラウズなど）では、この画面を開いている間だけ無効になる
    }
}

/** 遅延のあとに handler を実行し、その結果を返す。「失敗させる」設定のときは ApiError を投げる。 */
export async function mockRequest<T>(handler: () => T): Promise<T> {
    const { fail, slow } = getMockOptions();
    const latency = slow ? SLOW_LATENCY_MS : LATENCY_MS;
    if (latency > 0) await new Promise((resolve) => setTimeout(resolve, latency));
    if (fail) throw new ApiError();
    // 呼び出し側が受け取った値を書き換えても、ダミーのデータベースに影響しないよう複製して返す
    return structuredClone(handler());
}
