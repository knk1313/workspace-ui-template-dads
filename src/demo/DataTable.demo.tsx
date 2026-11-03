import { useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusChip, type ChipStatus } from "@/components/ui/ChipLabel";
import { DataTable, type DataTableColumn, type SortState } from "@/components/ui/DataTable";
import type { ComponentDemo } from "./types";

type Application = {
    id: string;
    applicant: string;
    category: string;
    amount: number;
    submittedAt: string;
    status: "受付" | "審査中" | "完了" | "差戻し";
};

const CATEGORIES = ["住民票の写し", "印鑑登録証明書", "戸籍謄本", "課税証明書", "納税証明書"];
const NAMES = ["山田 太郎", "佐藤 花子", "鈴木 一郎", "高橋 美咲", "田中 健", "伊藤 さくら", "渡辺 大輔", "中村 由美"];
const STATUSES: Application["status"][] = ["受付", "審査中", "完了", "差戻し"];
const STATUS_TO_CHIP: Record<Application["status"], ChipStatus> = { 受付: "info", 審査中: "warning", 完了: "success", 差戻し: "error" };

// 25 件のダミーデータ（決定的に生成する）
const applications: Application[] = Array.from({ length: 25 }, (_, i) => ({
    id: `A-2026-${String(121 + i).padStart(5, "0")}`,
    applicant: NAMES[i % NAMES.length],
    category: CATEGORIES[(i * 3) % CATEGORIES.length],
    amount: [300, 300, 450, 300, 400][(i * 3) % 5] * (1 + (i % 3)),
    submittedAt: `2026-10-${String(1 + (i % 28)).padStart(2, "0")}`,
    status: STATUSES[(i * 7) % STATUSES.length],
}));

const columns: DataTableColumn<Application>[] = [
    { key: "id", header: "申請番号", accessor: (r) => r.id, sortable: true, rowHeader: true, width: "w-44" },
    { key: "applicant", header: "申請者", accessor: (r) => r.applicant, sortable: true },
    { key: "category", header: "種別", accessor: (r) => r.category },
    { key: "amount", header: "手数料（円）", accessor: (r) => r.amount, sortable: true, align: "right", render: (r) => r.amount.toLocaleString("ja-JP") },
    { key: "submittedAt", header: "申請日", accessor: (r) => r.submittedAt, sortable: true, align: "right" },
    { key: "status", header: "状態", accessor: (r) => r.status, render: (r) => <StatusChip status={STATUS_TO_CHIP[r.status]}>{r.status}</StatusChip> },
];

function Full() {
    const [selected, setSelected] = useState<string[]>([]);
    const [sort, setSort] = useState<SortState>({ key: "submittedAt", direction: "desc" });
    return (
        <DataTable
            caption="証明書の交付申請"
            columns={columns}
            rows={applications}
            getRowId={(r) => r.id}
            getRowLabel={(r) => `${r.id}（${r.applicant}）`}
            selectable
            selectedIds={selected}
            onSelectionChange={setSelected}
            sort={sort}
            onSortChange={setSort}
            pageSize={10}
            bulkActions={
                <>
                    <Button variant="outline" size="sm" leadIcon={Download}>
                        CSV を出力
                    </Button>
                    <Button variant="outline" size="sm" tone="error" leadIcon={Trash2}>
                        取り下げ
                    </Button>
                </>
            }
            rowActions={() => (
                <Button variant="text" size="sm">
                    詳細
                </Button>
            )}
        />
    );
}

const demo: ComponentDemo = {
    slug: "data-table",
    title: "データテーブル",
    category: "データ表示",
    description: "大量のレコードを一覧し、並べ替え・行選択・一括操作・ページ送りを提供する業務用の表。1 行 1 レコード、セル結合なし。",
    dadsUrl: "https://design.digital.go.jp/dads/components/table/",
    source: "@/components/ui/DataTable",
    examples: [
        {
            title: "並べ替え + 行選択 + 一括操作 + ページ送り",
            description: "ソート可能な列は下線付きテキスト + 矢印アイコン（昇順 → 降順 → なし）。行を選ぶと表の上に一括操作バーが出る。全選択は表示中のページが対象。",
            render: () => <Full />,
        },
        {
            title: "Dense + ストライプ",
            description: "情報密度を優先する一覧。数値列（手数料）と日付列は右寄せ + 等幅数字。",
            render: () => <DataTable columns={columns} rows={applications.slice(0, 8)} getRowId={(r) => r.id} size="dense" striped hoverHighlight={false} />,
        },
        {
            title: "空状態",
            description: "既定は「該当するデータがありません」。emptyState で次の行動を案内できる。",
            render: () => (
                <div className="flex flex-col gap-6">
                    <DataTable columns={columns} rows={[]} getRowId={(r) => r.id} selectable />
                    <DataTable
                        columns={columns}
                        rows={[]}
                        getRowId={(r) => r.id}
                        emptyState={
                            <div className="flex flex-col items-center gap-2">
                                <p className="m-0">条件に一致する申請はありません。</p>
                                <Button variant="outline" size="sm">
                                    絞り込みを解除
                                </Button>
                            </div>
                        }
                    />
                </div>
            ),
        },
        {
            title: "読み込み中",
            description: "aria-busy を付け、スピナーとスケルトン行を表示する。",
            render: () => <DataTable columns={columns} rows={[]} getRowId={(r) => r.id} loading pageSize={5} selectable />,
        },
        {
            title: "固定ヘッダー + 縦スクロール",
            description: "高さを制限した領域で縦スクロールするとき、見出しを上端に固定する。",
            render: () => <DataTable columns={columns} rows={applications} getRowId={(r) => r.id} stickyHeader wrapperClassName="max-h-80 overflow-y-auto" size="dense" />,
        },
    ],
};

export default demo;
