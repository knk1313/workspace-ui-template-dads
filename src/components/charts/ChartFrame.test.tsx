import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { ChartDataTable, ChartFrame } from "./ChartFrame";
import { buildCompareSummary, buildShareSummary, buildTrendSummary, formatNumber, formatPercent, seriesFill, seriesStyle } from "./chartUtils";

describe("ChartFrame", () => {
    it("figure / figcaptionに見出し・単位・説明・凡例・メタ情報を出す", () => {
        const { container } = render(
            <ChartFrame
                title="申請件数の月次推移"
                as="h2"
                unit="件"
                description="直近12か月"
                source="申請管理システム"
                note="取り下げを除く"
                updatedAt="2026-10-31"
                legend={[
                    { name: "申請", kind: "line", color: "var(--color-chart-1)", shape: "circle" },
                    { name: "承認", kind: "fill", color: "var(--color-chart-2)", pattern: "diagonal" },
                ]}
                actions={<button type="button">期間を変更</button>}
            >
                <svg role="img" aria-label="グラフ" />
            </ChartFrame>,
        );
        const figure = container.querySelector("figure");
        expect(figure).toBeInTheDocument();
        expect(figure?.querySelector("figcaption")).toHaveTextContent("申請件数の月次推移");
        expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("単位：件");
        expect(screen.getByText("直近12か月")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "期間を変更" })).toBeInTheDocument();
        const legend = screen.getByRole("list", { name: "凡例" });
        expect(within(legend).getAllByRole("listitem")).toHaveLength(2);
        // 凡例の記号は装飾
        expect(legend.querySelectorAll("svg[aria-hidden='true']")).toHaveLength(2);
        expect(legend.querySelector("pattern")).toBeInTheDocument();
        expect(screen.getByText("申請管理システム")).toBeInTheDocument();
        expect(screen.getByText("2026-10-31")).toBeInTheDocument();
        // table を渡していないのでトグルは出ない
        expect(screen.queryByRole("button", { name: /データテーブル/ })).not.toBeInTheDocument();
    });

    it("高さはh-chart（既定）とh-chart-sm", () => {
        const { container, rerender } = render(
            <ChartFrame title="A">
                <span>chart</span>
            </ChartFrame>,
        );
        expect(container.querySelector(".h-chart")).toBeInTheDocument();
        rerender(
            <ChartFrame title="A" height="sm">
                <span>chart</span>
            </ChartFrame>,
        );
        expect(container.querySelector(".h-chart-sm")).toBeInTheDocument();
    });

    it("データテーブルのトグルはaria-expanded / aria-controlsを持ち、キーボードで操作できる", async () => {
        const user = userEvent.setup();
        render(
            <ChartFrame
                title="A"
                table={<ChartDataTable caption="A" rowHeader={{ key: "x", label: "時点" }} columns={[{ key: "v", label: "値" }]} rows={[{ x: "4月", v: 1234 }]} unit="件" />}
            >
                <span>chart</span>
            </ChartFrame>,
        );
        const toggle = screen.getByRole("button", { name: "数値の表を表示" });
        expect(toggle).toHaveAttribute("aria-expanded", "false");
        expect(toggle).toHaveAttribute("aria-controls");
        await user.tab();
        expect(toggle).toHaveFocus();
        await user.keyboard("{Enter}");
        const table = screen.getByRole("table", { name: /A/ });
        expect(table.closest("div[id]")?.id).toBe(toggle.getAttribute("aria-controls"));
        expect(within(table).getByRole("columnheader", { name: "時点" })).toHaveAttribute("scope", "col");
        expect(within(table).getByRole("rowheader", { name: "4月" })).toHaveAttribute("scope", "row");
        expect(within(table).getByRole("cell", { name: "1,234件" })).toHaveClass("text-right", "nums");
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(
            <ChartFrame
                title="A"
                unit="件"
                legend={[{ name: "申請", kind: "fill", color: "var(--color-chart-1)" }]}
                table={<ChartDataTable caption="A" rowHeader={{ key: "x", label: "時点" }} columns={[{ key: "v", label: "値" }]} rows={[{ x: "4月", v: 1 }]} />}
                defaultTableOpen
            >
                <svg role="img" aria-label="グラフ" />
            </ChartFrame>,
        );
        await expectNoA11yViolations(container);
    });
});

describe("chartUtils", () => {
    it("formatNumber / formatPercent", () => {
        expect(formatNumber(1234567, "件")).toBe("1,234,567件");
        expect(formatNumber(12.5)).toBe("12.5");
        expect(formatNumber(undefined)).toBe("—");
        expect(formatNumber("4月")).toBe("4月");
        expect(formatPercent(0.1234)).toBe("12.3%");
        expect(formatPercent(1, 0)).toBe("100%");
    });

    it("系列の色・形・線種・模様は5種類で、6番目以降は5番目に揃う", () => {
        const styles = Array.from({ length: 6 }, (_, i) => seriesStyle(i));
        expect(new Set(styles.slice(0, 5).map((s) => s.shape)).size).toBe(5);
        expect(new Set(styles.slice(0, 5).map((s) => s.pattern)).size).toBe(5);
        expect(styles[0].color).toBe("var(--color-chart-1)");
        expect(styles[5]).toEqual(styles[4]);
        expect(seriesFill("c", 0, true)).toBe("var(--color-chart-1)");
        expect(seriesFill("c", 1, true)).toBe("url(#c-pattern-1)");
        expect(seriesFill("c", 1, false)).toBe("var(--color-chart-2)");
    });

    it("要約文を生成する", () => {
        const data = [
            { m: "4月", a: 10 },
            { m: "5月", a: 30 },
            { m: "6月", a: 20 },
        ];
        expect(buildTrendSummary({ title: "推移", data, series: [{ key: "a", name: "申請" }], xKey: "m", unit: "件" })).toBe("推移。3時点。申請の推移、最新値20件（6月）。");
        expect(buildCompareSummary({ title: "比較", data, series: [{ key: "a", name: "申請" }], xKey: "m" })).toBe("比較。3項目。申請は5月が最大30、4月が最小10。");
        expect(buildShareSummary("構成比", [{ name: "A", value: 3 }, { name: "B", value: 1 }], "件")).toBe("構成比。合計4件。A 3件（75%）、B 1件（25%）。");
        expect(buildTrendSummary({ title: "推移", data: [], series: [], xKey: "m" })).toBe("推移。データがありません。");
    });
});
