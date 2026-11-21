// API が失敗したときに投げるエラー。ダミーの API（mock.ts）を実際の API に替えても、この型は残す。
// 画面は message をそのまま表示するので、利用者に見せられる文にする（技術的な内容は入れない）。

export class ApiError extends Error {
    constructor(message = "通信に失敗しました。時間をおいて、もう一度お試しください。") {
        super(message);
        this.name = "ApiError";
    }
}
