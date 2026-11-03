import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "./Table";

function renderTable(props: Partial<Parameters<typeof Table>[0]> = {}) {
    return render(
        <Table caption="申請一覧" {...props}>
            <TableHead>
                <TableRow>
                    <TableHeaderCell>申請番号</TableHeaderCell>
                    <TableHeaderCell>申請者</TableHeaderCell>
                    <TableHeaderCell align="right">金額</TableHeaderCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableHeaderCell scope="row">A-001</TableHeaderCell>
                    <TableCell>山田 太郎</TableCell>
                    <TableCell align="right">12,000</TableCell>
                </TableRow>
                <TableRow selected>
                    <TableHeaderCell scope="row">A-002</TableHeaderCell>
                    <TableCell>佐藤 花子</TableCell>
                    <TableCell align="right">3,500</TableCell>
                </TableRow>
            </TableBody>
        </Table>,
    );
}

describe("Table", () => {
    it("caption・列見出し（scope=col）・行見出し（scope=row）を描画する", () => {
        renderTable();
        expect(screen.getByRole("table", { name: "申請一覧" })).toBeInTheDocument();
        const col = screen.getByRole("columnheader", { name: "申請者" });
        expect(col).toHaveAttribute("scope", "col");
        expect(col).toHaveClass("bg-surface-strong", "font-bold", "border-border-emphasis");
        const row = screen.getByRole("rowheader", { name: "A-001" });
        expect(row).toHaveAttribute("scope", "row");
    });

    it("数値列は右寄せ + 等幅数字、セルは上寄せ", () => {
        renderTable();
        expect(screen.getByRole("columnheader", { name: "金額" })).toHaveClass("text-right", "nums");
        const cell = screen.getByRole("cell", { name: "12,000" });
        expect(cell).toHaveClass("text-right", "nums", "align-top", "border-b", "border-border");
        expect(screen.getByRole("cell", { name: "山田 太郎" })).toHaveClass("text-left");
    });

    it("size=denseでセルの余白と行高を詰める", () => {
        const { rerender } = render(
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>A</TableCell>
                    </TableRow>
                </TableBody>
            </Table>,
        );
        expect(screen.getByRole("cell")).toHaveClass("py-5", "px-4");
        expect(screen.getByRole("table")).toHaveClass("leading-170");
        rerender(
            <Table size="dense">
                <TableBody>
                    <TableRow>
                        <TableCell>A</TableCell>
                    </TableRow>
                </TableBody>
            </Table>,
        );
        expect(screen.getByRole("cell")).toHaveClass("py-3", "px-4");
        expect(screen.getByRole("table")).toHaveClass("leading-130");
    });

    it("striped / hoverHighlight / selectableでは罫線を濃くし、行にストライプ・ホバー・選択の背景を付ける", () => {
        renderTable({ striped: true, hoverHighlight: true });
        expect(screen.getByRole("cell", { name: "12,000" })).toHaveClass("border-border-table");
        const rows = screen.getAllByRole("row");
        // 0 はヘッダー行: ストライプもホバーも付けない
        expect(rows[0]).not.toHaveClass("even:bg-surface-muted");
        expect(rows[1]).toHaveClass("even:bg-surface-muted", "hover:bg-surface-hover");
        expect(rows[2]).toHaveClass("bg-surface-selected");
    });

    it("横スクロールの外枠とfullWidth / stickyHeader", () => {
        const { rerender } = renderTable();
        const table = screen.getByRole("table");
        expect(table.parentElement).toHaveClass("overflow-x-auto", "max-md:scroll-shadow-x");
        expect(table).toHaveClass("w-full");
        rerender(
            <Table fullWidth={false} stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableHeaderCell>A</TableHeaderCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>1</TableCell>
                    </TableRow>
                </TableBody>
            </Table>,
        );
        expect(screen.getByRole("table")).not.toHaveClass("w-full");
        expect(screen.getByRole("columnheader").closest("thead")).toHaveClass("sticky", "top-0");
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = renderTable({ striped: true });
        await expectNoA11yViolations(container);
    });
});
