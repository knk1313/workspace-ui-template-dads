import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { Button } from "./Button";
import { DataTable, type DataTableColumn } from "./DataTable";

type Row = { id: string; name: string; amount: number; status: string };

const rows: Row[] = [
    { id: "1", name: "佐藤", amount: 300, status: "審査中" },
    { id: "2", name: "山田", amount: 100, status: "完了" },
    { id: "3", name: "鈴木", amount: 200, status: "受付" },
];

const columns: DataTableColumn<Row>[] = [
    { key: "name", header: "氏名", accessor: (r) => r.name, sortable: true, rowHeader: true },
    { key: "amount", header: "金額", accessor: (r) => r.amount, sortable: true, align: "right" },
    { key: "status", header: "状態", accessor: (r) => r.status },
];

/** tbody の各行の行見出し（氏名）を順に返す。 */
function bodyNames(): string[] {
    const body = screen.getByRole("table").querySelector("tbody")!;
    return within(body)
        .getAllByRole("rowheader")
        .map((th) => th.textContent ?? "");
}

describe("DataTable", () => {
    it("列見出しと行を描画し、数値列は右寄せになる", () => {
        render(<DataTable columns={columns} rows={rows} getRowId={(r) => r.id} caption="申請一覧" />);
        expect(screen.getByRole("table", { name: "申請一覧" })).toBeInTheDocument();
        expect(screen.getByRole("columnheader", { name: /金額/ })).toHaveClass("text-right");
        expect(screen.getByRole("cell", { name: "300" })).toHaveClass("text-right", "nums");
        expect(bodyNames()).toEqual(["佐藤", "山田", "鈴木"]);
    });

    it("ソート可能列のクリックで 昇順 → 降順 → なし と切り替わり、順序と aria-sort が変わる", async () => {
        const user = userEvent.setup();
        render(<DataTable columns={columns} rows={rows} getRowId={(r) => r.id} />);
        const header = screen.getByRole("columnheader", { name: /金額/ });
        const button = within(header).getByRole("button");
        expect(header).toHaveAttribute("aria-sort", "none");
        expect(button).toHaveClass("underline");

        await user.click(button);
        expect(header).toHaveAttribute("aria-sort", "ascending");
        expect(bodyNames()).toEqual(["山田", "鈴木", "佐藤"]);

        await user.click(button);
        expect(header).toHaveAttribute("aria-sort", "descending");
        expect(bodyNames()).toEqual(["佐藤", "鈴木", "山田"]);

        await user.click(button);
        expect(header).toHaveAttribute("aria-sort", "none");
        expect(bodyNames()).toEqual(["佐藤", "山田", "鈴木"]);

        // ソート不可の列にはボタンも aria-sort もない
        const plain = screen.getByRole("columnheader", { name: "状態" });
        expect(plain).not.toHaveAttribute("aria-sort");
        expect(within(plain).queryByRole("button")).not.toBeInTheDocument();
    });

    it("制御されたソート（sort / onSortChange）", async () => {
        const user = userEvent.setup();
        const onSortChange = vi.fn();
        render(<DataTable columns={columns} rows={rows} getRowId={(r) => r.id} sort={{ key: "name", direction: "desc" }} onSortChange={onSortChange} />);
        expect(screen.getByRole("columnheader", { name: /氏名/ })).toHaveAttribute("aria-sort", "descending");
        await user.click(within(screen.getByRole("columnheader", { name: /氏名/ })).getByRole("button"));
        expect(onSortChange).toHaveBeenCalledWith(null);
    });

    it("行選択: チェックボックスで選択し、全選択は一部選択で indeterminate になる。一括操作バーが出る", async () => {
        const user = userEvent.setup();
        const onSelectionChange = vi.fn();
        render(
            <DataTable
                columns={columns}
                rows={rows}
                getRowId={(r) => r.id}
                selectable
                onSelectionChange={onSelectionChange}
                bulkActions={<Button variant="outline">一括承認</Button>}
            />,
        );
        const all = screen.getByRole("checkbox", { name: "すべての行を選択" });
        expect(screen.queryByRole("region", { name: "選択中の項目の操作" })).not.toBeInTheDocument();

        await user.click(screen.getByRole("checkbox", { name: "佐藤 を選択" }));
        expect(onSelectionChange).toHaveBeenLastCalledWith(["1"]);
        expect(all).toBePartiallyChecked();
        expect(all).not.toBeChecked();
        const region = screen.getByRole("region", { name: "選択中の項目の操作" });
        expect(region).toHaveTextContent("1 件選択中");
        expect(within(region).getByRole("button", { name: "一括承認" })).toBeInTheDocument();
        // 選択行はハイライト
        expect(screen.getByRole("checkbox", { name: "佐藤 を選択" }).closest("tr")).toHaveClass("bg-surface-selected");

        await user.click(all);
        expect(onSelectionChange).toHaveBeenLastCalledWith(["1", "2", "3"]);
        expect(all).toBeChecked();
        expect(all).not.toBePartiallyChecked();
        expect(screen.getByRole("region", { name: "選択中の項目の操作" })).toHaveTextContent("3 件選択中");

        await user.click(all);
        expect(onSelectionChange).toHaveBeenLastCalledWith([]);

        await user.click(screen.getByRole("checkbox", { name: "山田 を選択" }));
        await user.click(screen.getByRole("button", { name: "選択を解除" }));
        expect(onSelectionChange).toHaveBeenLastCalledWith([]);
        expect(screen.queryByRole("region", { name: "選択中の項目の操作" })).not.toBeInTheDocument();
    });

    it("ページ送り: pageSize ごとに表示行が変わり、件数の範囲を表示する", async () => {
        const user = userEvent.setup();
        const many: Row[] = Array.from({ length: 23 }, (_, i) => ({ id: String(i + 1), name: `利用者${String(i + 1).padStart(2, "0")}`, amount: i, status: "受付" }));
        const onPageChange = vi.fn();
        render(<DataTable columns={columns} rows={many} getRowId={(r) => r.id} pageSize={10} onPageChange={onPageChange} />);
        expect(bodyNames()).toHaveLength(10);
        expect(bodyNames()[0]).toBe("利用者01");
        expect(screen.getByText("全 23 件中 1〜10 件")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "次のページ" }));
        expect(onPageChange).toHaveBeenCalledWith(2);
        expect(bodyNames()[0]).toBe("利用者11");
        expect(screen.getByText("全 23 件中 11〜20 件")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "3 ページ目" }));
        expect(bodyNames()).toHaveLength(3);
        expect(screen.getByText("全 23 件中 21〜23 件")).toBeInTheDocument();

        // 並べ替えると 1 ページ目に戻る
        await user.click(within(screen.getByRole("columnheader", { name: /金額/ })).getByRole("button"));
        expect(onPageChange).toHaveBeenLastCalledWith(1);
        expect(screen.getByText("全 23 件中 1〜10 件")).toBeInTheDocument();
    });

    it("全選択は表示中のページの行だけを対象にする", async () => {
        const user = userEvent.setup();
        const many: Row[] = Array.from({ length: 12 }, (_, i) => ({ id: String(i + 1), name: `u${i + 1}`, amount: i, status: "受付" }));
        const onSelectionChange = vi.fn();
        render(<DataTable columns={columns} rows={many} getRowId={(r) => r.id} pageSize={5} selectable onSelectionChange={onSelectionChange} />);
        await user.click(screen.getByRole("checkbox", { name: "すべての行を選択" }));
        expect(onSelectionChange).toHaveBeenLastCalledWith(["1", "2", "3", "4", "5"]);
    });

    it("空状態: 既定のメッセージ、または emptyState を colSpan で表示する", () => {
        const { rerender } = render(<DataTable columns={columns} rows={[]} getRowId={(r) => r.id} selectable rowActions={() => <Button size="sm">編集</Button>} />);
        const cell = screen.getByRole("cell", { name: "該当するデータがありません" });
        expect(cell).toHaveAttribute("colspan", "5");
        rerender(<DataTable columns={columns} rows={[]} getRowId={(r) => r.id} emptyState={<p>条件を変えて検索してください</p>} />);
        expect(screen.getByText("条件を変えて検索してください")).toBeInTheDocument();
        expect(screen.getByRole("cell")).toHaveAttribute("colspan", "3");
    });

    it("loading: aria-busy とスピナー、スケルトン行を表示する", () => {
        render(<DataTable columns={columns} rows={rows} getRowId={(r) => r.id} loading pageSize={4} />);
        expect(screen.getByRole("table").closest("[aria-busy]")).toHaveAttribute("aria-busy", "true");
        expect(screen.getByRole("status")).toHaveTextContent("読み込み中");
        const skeletons = screen.getByRole("table").querySelectorAll(".animate-pulse");
        expect(skeletons).toHaveLength(4 * columns.length);
        expect(screen.queryByText("佐藤")).not.toBeInTheDocument();
    });

    it("rowActions を末尾列に表示し、size=dense で余白を詰める", () => {
        const onEdit = vi.fn();
        render(
            <DataTable
                columns={columns}
                rows={rows}
                getRowId={(r) => r.id}
                size="dense"
                rowActions={(r) => (
                    <Button size="sm" variant="text" onClick={() => onEdit(r.id)}>
                        編集
                    </Button>
                )}
            />,
        );
        expect(screen.getByRole("columnheader", { name: "操作" })).toBeInTheDocument();
        expect(screen.getAllByRole("button", { name: "編集" })).toHaveLength(3);
        expect(screen.getByRole("cell", { name: "審査中" })).toHaveClass("py-3");
    });

    it("キーボード: ソートボタンとチェックボックスに Tab で到達し、Enter / Space で操作できる", async () => {
        const user = userEvent.setup();
        const onSortChange = vi.fn();
        const onSelectionChange = vi.fn();
        render(<DataTable columns={columns} rows={rows} getRowId={(r) => r.id} selectable onSortChange={onSortChange} onSelectionChange={onSelectionChange} />);
        await user.tab(); // 全選択
        expect(screen.getByRole("checkbox", { name: "すべての行を選択" })).toHaveFocus();
        await user.keyboard(" ");
        expect(onSelectionChange).toHaveBeenLastCalledWith(["1", "2", "3"]);
        await user.tab(); // 氏名のソート
        expect(within(screen.getByRole("columnheader", { name: /氏名/ })).getByRole("button")).toHaveFocus();
        await user.keyboard("{Enter}");
        expect(onSortChange).toHaveBeenLastCalledWith({ key: "name", direction: "asc" });
    });

    it("アクセシビリティ違反がない（通常・選択あり・空・読み込み中）", async () => {
        const { container } = render(
            <div>
                <DataTable columns={columns} rows={rows} getRowId={(r) => r.id} caption="一覧" selectable defaultSelectedIds={["1"]} pageSize={2} rowActions={() => <Button size="sm">編集</Button>} />
                <DataTable columns={columns} rows={[]} getRowId={(r) => r.id} caption="空" />
                <DataTable columns={columns} rows={rows} getRowId={(r) => r.id} caption="読み込み中" loading />
            </div>,
        );
        await expectNoA11yViolations(container);
    });
});
