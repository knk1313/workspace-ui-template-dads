import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { LineChart } from "./LineChart";

const data = [
    { month: "4月", applications: 1200, approvals: 900 },
    { month: "5月", applications: 1350, approvals: 1000 },
    { month: "6月", applications: 1180, approvals: 980 },
];
const series = [
    { key: "applications", name: "申請" },
    { key: "approvals", name: "承認" },
];
const size = { width: 600, height: 240 };

describe("LineChart", () => {
    it("SVGにrole=imgと要約のaria-labelを付け、タイトルと単位を表示する", () => {
        render(<LineChart title="申請件数の月次推移" unit="件" data={data} xKey="month" series={series} size={size} />);
        const img = screen.getByRole("img");
        expect(img.tagName).toBe("svg");
        expect(img).toHaveAttribute("aria-label", expect.stringContaining("申請件数の月次推移"));
        expect(img).toHaveAttribute("aria-label", expect.stringContaining("申請の推移、最新値1,180件（6月）"));
        expect(screen.getByRole("heading", { level: 3, name: /申請件数の月次推移/ })).toHaveTextContent("単位：件");
    });

    it("summaryを渡すとaria-labelに使う", () => {
        render(<LineChart title="推移" data={data} xKey="month" series={series} summary="独自の要約" size={size} />);
        expect(screen.getByRole("img")).toHaveAttribute("aria-label", "独自の要約");
    });

    it("系列の数だけ線とデータ点を描き、系列ごとに形が違う", () => {
        const { container } = render(<LineChart title="推移" data={data} xKey="month" series={series} size={size} />);
        const lines = container.querySelectorAll("path.recharts-line-curve");
        expect(lines).toHaveLength(2);
        expect(container.querySelectorAll("[data-dot='applications']")).toHaveLength(3);
        expect(container.querySelectorAll("[data-dot='approvals']")).toHaveLength(3);
        const d1 = container.querySelector("[data-dot='applications']")?.getAttribute("d");
        const d2 = container.querySelector("[data-dot='approvals']")?.getAttribute("d");
        expect(d1).not.toBe(d2);
        // 2 系列目は破線、色は CSS 変数
        expect(lines[0]).toHaveAttribute("stroke", "var(--color-chart-1)");
        expect(lines[1]).toHaveAttribute("stroke", "var(--color-chart-2)");
        expect(lines[1]).toHaveAttribute("stroke-dasharray", "8 4");
    });

    it("showDots=falseでデータ点を描かない", () => {
        const { container } = render(<LineChart title="推移" data={data} xKey="month" series={series} showDots={false} size={size} />);
        expect(container.querySelectorAll("[data-dot]")).toHaveLength(0);
    });

    it("凡例に系列名を出す", () => {
        render(<LineChart title="推移" data={data} xKey="month" series={series} size={size} />);
        const legend = screen.getByRole("list", { name: "凡例" });
        expect(within(legend).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["申請", "承認"]);
    });

    it("参照線のラベルを描く", () => {
        render(<LineChart title="推移" data={data} xKey="month" series={series} referenceLine={{ y: 1300, label: "目標1,300件" }} size={size} />);
        expect(screen.getByText("目標1,300件")).toBeInTheDocument();
    });

    it("データテーブルをトグルで表示する（caption・見出し・数値）", async () => {
        const user = userEvent.setup();
        render(<LineChart title="申請件数の月次推移" unit="件" data={data} xKey="month" series={series} size={size} />);
        const toggle = screen.getByRole("button", { name: "数値の表を表示" });
        expect(toggle).toHaveAttribute("aria-expanded", "false");
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
        await user.click(toggle);
        expect(screen.getByRole("button", { name: "数値の表を閉じる" })).toHaveAttribute("aria-expanded", "true");
        const table = screen.getByRole("table", { name: /申請件数の月次推移/ });
        expect(within(table).getByRole("columnheader", { name: "申請" })).toBeInTheDocument();
        expect(within(table).getByRole("rowheader", { name: "5月" })).toBeInTheDocument();
        expect(within(table).getByRole("cell", { name: "1,350件" })).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: "数値の表を閉じる" }));
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("出典・注記・更新日を表示する", () => {
        render(<LineChart title="推移" data={data} xKey="month" series={series} source="申請管理システム" note="取り下げを除く" updatedAt="2026-10-31" size={size} />);
        expect(screen.getByText("申請管理システム")).toBeInTheDocument();
        expect(screen.getByText("取り下げを除く")).toBeInTheDocument();
        expect(screen.getByText("2026-10-31")).toBeInTheDocument();
    });

    it("6系列以上は5系列に制限する", () => {
        const many = Array.from({ length: 6 }, (_, i) => ({ key: `s${i}`, name: `系列${i}` }));
        const rows = data.map((d) => ({ ...d, s0: 1, s1: 2, s2: 3, s3: 4, s4: 5, s5: 6 }));
        const { container } = render(<LineChart title="推移" data={rows} xKey="month" series={many} size={size} />);
        expect(container.querySelectorAll("path.recharts-line-curve")).toHaveLength(5);
    });

    it("アクセシビリティ違反がない", async () => {
        const user = userEvent.setup();
        const { container } = render(
            <LineChart title="申請件数の月次推移" unit="件" data={data} xKey="month" series={series} referenceLine={{ y: 1300, label: "目標" }} source="出典" updatedAt="2026-10-31" size={size} />,
        );
        await expectNoA11yViolations(container);
        await user.click(screen.getByRole("button", { name: "数値の表を表示" }));
        await expectNoA11yViolations(container);
    });
});
