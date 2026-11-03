// 画面表示用の架空データ（申請管理）。実在の組織・人物・数値とは関係ありません。
// 実データに差し替えるときは、このディレクトリを API 呼び出し等に置き換える。

export type ApplicationStatus = "draft" | "submitted" | "reviewing" | "approved" | "returned" | "rejected";
export type ApplicationCategory = "subsidy" | "permit" | "certificate" | "report" | "other";

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
    draft: "下書き",
    submitted: "受付済み",
    reviewing: "審査中",
    approved: "承認",
    returned: "差戻し",
    rejected: "不承認",
};

export const CATEGORY_LABELS: Record<ApplicationCategory, string> = {
    subsidy: "補助金",
    permit: "許認可",
    certificate: "証明書",
    report: "届出",
    other: "その他",
};

export type Application = {
    id: string;
    /** 受付番号（例: R08-000123）。 */
    number: string;
    title: string;
    applicant: string;
    organization: string;
    category: ApplicationCategory;
    status: ApplicationStatus;
    /** 申請額（円）。届出など金額のないものは 0。 */
    amount: number;
    /** 担当者。 */
    assignee: string;
    /** ISO 8601 */
    submittedAt: string;
    /** ISO 8601 */
    updatedAt: string;
    /** 添付ファイル。 */
    attachments: { name: string; size: number }[];
    memo?: string;
};

export const CURRENT_USER = {
    id: "u-001",
    name: "佐藤 花子",
    email: "sato.hanako@example.go.jp",
    department: "デジタル推進課",
    role: "管理者",
};

export const ASSIGNEES = ["佐藤 花子", "鈴木 一郎", "高橋 美咲", "田中 健太"] as const;

const TITLES: Record<ApplicationCategory, string[]> = {
    subsidy: ["中小企業デジタル化支援補助金", "子育て世帯向け住宅改修補助金", "再生可能エネルギー導入補助金", "商店街活性化事業補助金"],
    permit: ["道路占用許可申請", "屋外広告物設置許可申請", "特定建設作業実施届", "公園使用許可申請"],
    certificate: ["納税証明書交付申請", "住民票の写し交付申請", "印鑑登録証明書交付申請", "課税証明書交付申請"],
    report: ["事業所開設届", "給水装置工事届", "廃棄物処理計画届", "防火管理者選任届"],
    other: ["意見書の提出", "情報公開請求", "施設利用の相談", "各種お問い合わせ"],
};

const APPLICANTS = [
    ["山田 太郎", "株式会社やまだ商事"],
    ["伊藤 さくら", "いとう設計事務所"],
    ["渡辺 大輔", "有限会社わたなべ建設"],
    ["中村 彩", "個人"],
    ["小林 誠", "こばやし電機株式会社"],
    ["加藤 恵", "NPO 法人かとう子育て支援"],
    ["吉田 翔", "個人"],
    ["山本 直子", "やまもと農園"],
    ["松本 隆", "まつもと運輸株式会社"],
    ["井上 由美", "いのうえ薬局"],
];

// 乱数ではなく決定的な生成にして、テストや画面の表示が毎回同じになるようにする。
function seeded(n: number): number {
    const x = Math.sin(n * 9301 + 49297) * 233280;
    return x - Math.floor(x);
}

const CATEGORIES: ApplicationCategory[] = ["subsidy", "permit", "certificate", "report", "other"];
const STATUSES: ApplicationStatus[] = ["submitted", "reviewing", "approved", "returned", "submitted", "reviewing", "approved", "draft", "rejected", "approved"];

function pad(n: number, len: number): string {
    return String(n).padStart(len, "0");
}

export function generateApplications(count = 64): Application[] {
    const base = Date.UTC(2026, 9, 31, 9, 0, 0); // 2026-10-31T09:00:00Z
    return Array.from({ length: count }, (_, i) => {
        const r = (k: number) => seeded(i * 7 + k);
        const category = CATEGORIES[Math.floor(r(1) * CATEGORIES.length)];
        const titles = TITLES[category];
        const [applicant, organization] = APPLICANTS[Math.floor(r(2) * APPLICANTS.length)];
        const status = STATUSES[Math.floor(r(3) * STATUSES.length)];
        const daysAgo = Math.floor(r(4) * 90);
        const submitted = base - daysAgo * 86400000 - Math.floor(r(5) * 8) * 3600000;
        const updated = submitted + Math.floor(r(6) * 5) * 86400000;
        const hasAmount = category === "subsidy" || category === "permit";
        return {
            id: `app-${pad(i + 1, 3)}`,
            number: `R08-${pad(1000 + i * 3, 6)}`,
            title: titles[Math.floor(r(7) * titles.length)],
            applicant,
            organization,
            category,
            status,
            amount: hasAmount ? Math.floor(r(8) * 48 + 2) * 50000 : 0,
            assignee: ASSIGNEES[Math.floor(r(9) * ASSIGNEES.length)],
            submittedAt: new Date(submitted).toISOString(),
            updatedAt: new Date(Math.min(updated, base)).toISOString(),
            attachments:
                r(10) > 0.4
                    ? [
                          { name: "申請書.pdf", size: Math.floor(r(11) * 900 + 100) * 1024 },
                          { name: "添付資料.xlsx", size: Math.floor(r(12) * 300 + 20) * 1024 },
                      ]
                    : [{ name: "申請書.pdf", size: Math.floor(r(11) * 900 + 100) * 1024 }],
            memo: r(13) > 0.7 ? "電話で補足説明あり。書類の再提出を依頼済み。" : undefined,
        };
    });
}

export const APPLICATIONS: Application[] = generateApplications();

export function findApplication(id: string): Application | undefined {
    return APPLICATIONS.find((a) => a.id === id);
}
