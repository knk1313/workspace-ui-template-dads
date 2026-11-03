import type { ReactNode } from "react";
import { DescriptionList } from "@/components/ui/DescriptionList";
import { formatFileSize } from "@/components/ui/FileUpload";
import { CATEGORY_LABELS } from "@/api/applicationTypes";
import { FIELD_LABELS } from "./fields";
import { formatAmount, type ApplicationFormValues, type FieldName } from "./validation";

// 確認画面の入力内容。入力画面と同じまとまり（基本情報・申請者・日程・担当・添付・補足）で説明リストにする。

const NONE = <span className="text-text-muted">未入力</span>;

/** "YYYY-MM-DD" を「2026年12月1日（火）」の形にする。 */
export function formatDateJa(iso: string): string {
    const [y, m, d] = iso.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const weekday = new Intl.DateTimeFormat("ja-JP", { weekday: "short" }).format(date);
    return `${y}年${m}月${d}日（${weekday}）`;
}

function text(value: string): ReactNode {
    return value.trim() === "" ? NONE : value.trim();
}

type Group = { title: string; items: [FieldName, ReactNode][] };

function groups(values: ApplicationFormValues): Group[] {
    return [
        {
            title: "基本情報",
            items: [
                ["title", text(values.title)],
                ["category", values.category ? CATEGORY_LABELS[values.category] : NONE],
                ["amount", formatAmount(values.amount) ?? NONE],
            ],
        },
        {
            title: "申請者",
            items: [
                ["applicant", text(values.applicant)],
                ["organization", text(values.organization)],
                ["email", text(values.email)],
                ["phone", text(values.phone)],
            ],
        },
        {
            title: "日程・担当",
            items: [
                ["desiredDate", values.desiredDate ? formatDateJa(values.desiredDate) : NONE],
                ["assignee", values.assignee || <span className="text-text-muted">指定なし</span>],
                ["priority", values.priority ? "希望する" : "希望しない"],
            ],
        },
        {
            title: "添付・補足",
            items: [
                [
                    "attachments",
                    values.attachments.length === 0 ? (
                        <span className="text-text-muted">なし</span>
                    ) : (
                        <ul className="m-0 flex list-none flex-col gap-1 p-0">
                            {values.attachments.map((f) => (
                                <li key={`${f.name}-${f.size}-${f.lastModified}`}>
                                    {f.name} <span className="text-text-muted nums">（{formatFileSize(f.size)}）</span>
                                </li>
                            ))}
                        </ul>
                    ),
                ],
                ["memo", values.memo.trim() === "" ? NONE : <span className="whitespace-pre-wrap">{values.memo.trim()}</span>],
            ],
        },
    ];
}

export function ApplicationFormConfirm({ values }: { values: ApplicationFormValues }) {
    return (
        <div className="flex flex-col gap-10">
            {groups(values).map((g) => (
                <div key={g.title} className="flex flex-col gap-2">
                    <h3 className="m-0 text-std-20B-150 text-text-strong">{g.title}</h3>
                    <DescriptionList divided items={g.items.map(([field, description]) => ({ term: FIELD_LABELS[field], description }))} />
                </div>
            ))}
        </div>
    );
}
