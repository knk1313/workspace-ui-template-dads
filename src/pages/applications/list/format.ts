// 一覧と詳細で共通の表示形式。

const yen = new Intl.NumberFormat("ja-JP");

/** 申請額を「1,250,000 円」の形にする。金額のない申請（0）は null を返し、画面側で「なし」と表示する。 */
export function formatAmount(amount: number): string | null {
    return amount > 0 ? `${yen.format(amount)}円` : null;
}

/** ファイルサイズを KB / MB で表示する。 */
export function formatFileSize(bytes: number): string {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
}
