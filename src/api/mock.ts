// ダミー API の土台。画面はこのディレクトリの関数だけを通してデータを読み書きする。
// 実際の API に置き換えるときは、src/api/*.ts の各関数の中身を fetch などに差し替える（画面側は変えなくてよい）。
// 差し替え終わったら、このファイルと、設定画面の「動作の確認」（src/pages/settings/MockApiOptions.tsx）を消す。
// エラーの型（ApiError）は errors.ts にあり、消しても残る。
//
// 見本として、通信の遅延と失敗を起こせる。設定画面の「表示」タブ →「動作の確認」で切り替える（ブラウザーのタブを閉じるまで有効）。

import { parseJson, readStored, writeStored } from "@/lib/storage";
import { ApiError } from "./errors";

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
    return readStored<MockOptions>(
        STORAGE_KEY,
        (raw) => {
            const saved = parseJson(raw);
            if (typeof saved !== "object" || saved === null) return undefined;
            const { fail, slow } = saved as Record<string, unknown>;
            return { fail: fail === true, slow: slow === true };
        },
        DEFAULT_OPTIONS,
        "session",
    );
}

export function setMockOptions(options: MockOptions): void {
    // 保存できない環境（プライベートブラウズなど）では、この画面を開いている間だけ無効になる
    writeStored(STORAGE_KEY, JSON.stringify(options), "session");
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
