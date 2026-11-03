// 担当者（職員）の架空データ。実在の組織・人物とは関係ありません。
// 申請の詳細画面で担当者の所属を表示するために使う。名前は applications.ts の ASSIGNEES と対応する。

export type StaffProfile = {
    name: string;
    department: string;
    /** 内線番号（架空）。 */
    extension: string;
};

export const STAFF_PROFILES: Record<string, StaffProfile> = {
    "佐藤 花子": { name: "佐藤 花子", department: "デジタル推進課", extension: "内線1201" },
    "鈴木 一郎": { name: "鈴木 一郎", department: "産業振興課", extension: "内線2305" },
    "高橋 美咲": { name: "高橋 美咲", department: "都市整備課", extension: "内線3110" },
    "田中 健太": { name: "田中 健太", department: "市民課", extension: "内線1042" },
};

/** 名前から担当者の情報を引く。登録のない名前は所属を「未登録」にして返す。 */
export function findStaff(name: string): StaffProfile {
    return STAFF_PROFILES[name] ?? { name, department: "所属未登録", extension: "" };
}
