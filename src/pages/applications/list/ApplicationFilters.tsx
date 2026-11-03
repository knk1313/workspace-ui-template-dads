import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ChipTag } from "@/components/ui/ChipTag";
import { Drawer } from "@/components/ui/Drawer";
import { FormField } from "@/components/ui/FormField";
import { SearchBox } from "@/components/ui/SearchBox";
import { Select } from "@/components/ui/Select";
import { useMediaQuery } from "@/layouts/useMediaQuery";
import { ASSIGNEES, CATEGORY_LABELS, STATUS_LABELS } from "@/mocks/applications";
import type { ApplicationQuery, FilterKey } from "./useApplicationQuery";

// 一覧の絞り込み。キーワード検索は常に表示し、種別・状態・担当者は
// md 以上ではカードに並べ、モバイルでは「絞り込み」ボタンで開くドロワーに入れる（画面の縦幅を一覧に使うため）。
// 適用中の条件はチップタグで並べ、1 つずつ外せるようにする。

/** md ブレークポイント（48rem = 768px）。 */
const MD_QUERY = "(min-width: 48rem)";

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));
const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));
// 選択肢が少ない（5 件以下）ため、3 つの絞り込みはすべてセレクトボックスにそろえる（DADS: 少数の選択肢はセレクト）。
const ASSIGNEE_OPTIONS = ASSIGNEES.map((name) => ({ value: name, label: name }));

type Props = {
    query: ApplicationQuery;
    resultCount: number;
    onFilterChange: (key: FilterKey, value: string) => void;
    onClear: () => void;
};

function FilterFields({ query, onFilterChange, idPrefix }: Pick<Props, "query" | "onFilterChange"> & { idPrefix: string }) {
    return (
        <>
            <FormField label="種別" id={`${idPrefix}-category`}>
                <Select block placeholder="すべて" options={CATEGORY_OPTIONS} value={query.category} onChange={(e) => onFilterChange("category", e.target.value)} />
            </FormField>
            <FormField label="状態" id={`${idPrefix}-status`}>
                <Select block placeholder="すべて" options={STATUS_OPTIONS} value={query.status} onChange={(e) => onFilterChange("status", e.target.value)} />
            </FormField>
            <FormField label="担当者" id={`${idPrefix}-assignee`}>
                <Select block placeholder="すべて" options={ASSIGNEE_OPTIONS} value={query.assignee} onChange={(e) => onFilterChange("assignee", e.target.value)} />
            </FormField>
        </>
    );
}

export function ApplicationFilters({ query, resultCount, onFilterChange, onClear }: Props) {
    const isDesktop = useMediaQuery(MD_QUERY);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // 入力中のキーワードは送信（Enter / 検索ボタン）するまで URL に書かない。
    // チップの削除や「条件をクリア」で URL 側が変わったときは入力欄も合わせる。
    const [text, setText] = useState(query.q);
    const [syncedQ, setSyncedQ] = useState(query.q);
    if (syncedQ !== query.q) {
        setSyncedQ(query.q);
        setText(query.q);
    }

    const chips = [
        query.q && { key: "q" as const, label: `キーワード: ${query.q}` },
        query.category && { key: "category" as const, label: `種別: ${CATEGORY_LABELS[query.category]}` },
        query.status && { key: "status" as const, label: `状態: ${STATUS_LABELS[query.status]}` },
        query.assignee && { key: "assignee" as const, label: `担当者: ${query.assignee}` },
    ].filter((c): c is { key: FilterKey; label: string } => Boolean(c));
    // ドロワーに入れた条件の数（キーワードはドロワーの外にあるので数えない）
    const drawerFilterCount = chips.filter((c) => c.key !== "q").length;

    const searchBox = (
        <SearchBox
            label="受付番号・件名・申請者で検索"
            showLabel
            value={text}
            onChange={setText}
            onSubmit={(value) => onFilterChange("q", value.trim())}
            onClear={() => {
                setText("");
                onFilterChange("q", "");
            }}
            className="w-full md:max-w-2xl"
        />
    );

    return (
        <div className="flex flex-col gap-4">
            {isDesktop ? (
                <Card>
                    <CardBody className="flex flex-col gap-6">
                        {searchBox}
                        {/* ラベルの下の入力欄と「条件をクリア」の下端を揃えるため items-end にする */}
                        <div className="grid items-end gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <FilterFields query={query} onFilterChange={onFilterChange} idPrefix="filter" />
                            <Button variant="outline" onClick={onClear} className="lg:justify-self-start">
                                条件をクリア
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            ) : (
                <Card padding="sm">
                    <CardBody className="flex flex-col gap-4">
                        {searchBox}
                        <Button variant="outline" leadIcon={SlidersHorizontal} onClick={() => setDrawerOpen(true)} aria-haspopup="dialog">
                            {drawerFilterCount > 0 ? `絞り込み（${drawerFilterCount}）` : "絞り込み"}
                        </Button>
                        <Drawer
                            open={drawerOpen}
                            onClose={() => setDrawerOpen(false)}
                            title="絞り込み"
                            dismissOnBackdrop={false}
                            footer={
                                <div className="flex items-center justify-between gap-4">
                                    <Button variant="outline" onClick={onClear}>
                                        条件をクリア
                                    </Button>
                                    <Button onClick={() => setDrawerOpen(false)}>{resultCount} 件を表示</Button>
                                </div>
                            }
                        >
                            <div className="flex flex-col gap-6 pt-2">
                                <FilterFields query={query} onFilterChange={onFilterChange} idPrefix="drawer-filter" />
                            </div>
                        </Drawer>
                    </CardBody>
                </Card>
            )}

            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                {chips.length > 0 ? (
                    <ul aria-label="適用中の条件" className="m-0 flex list-none flex-wrap items-center gap-2 p-0">
                        {chips.map((chip) => (
                            <li key={chip.key} className="flex">
                                <ChipTag label={chip.label} onRemove={() => onFilterChange(chip.key, "")} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="m-0 text-16 text-text-muted">絞り込み条件はありません</p>
                )}
                {/* 条件を変えるたびに件数を読み上げる */}
                <p role="status" className="m-0 text-16 text-text nums">
                    全 <span className="font-bold">{resultCount}</span> 件
                </p>
            </div>
        </div>
    );
}
