import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { AreaChart } from "./AreaChart";

const data = [
    { month: "4月", online: 600, counter: 400, mail: 200 },
    { month: "5月", online: 700, counter: 350, mail: 150 },
    { month: "6月", online: 800, counter: 300, mail: 100 },
];
const series = [
    { key: "online", name: "オンライン" },
    { key: "counter", name: "窓口" },
    { key: "mail", name: "郵送" },
];
const size = { width: 600, height: 240 };

describe("AreaChart", () => {
    it("SVG に role=img と要約の aria-label を付ける", () => {
        render(<AreaChart title="申請経路の月次推移" unit="件" data={data} xKey="month" series={series} size={size} />);
        const img = screen.getByRole("img");
        expect(img.tagName).toBe("svg");
        expect(img).toHaveAttribute("aria-label", expect.stringContaining("申請経路の月次推移"));
        expect(img).toHaveAttribute("aria-label", expect.stringContaining("郵送 の推移、最新値 100件（6月）"));
    });

    it("系列の数だけ面を描き、2 系列目以降は模様で塗る", () => {
        const { container } = render(<AreaChart title="推移" data={data} xKey="month" series={series} size={size} />);
        expect(container.querySelectorAll("path.recharts-area-area[data-series]")).toHaveLength(3);
        const fills = Array.from(container.querySelectorAll("path.recharts-area-area")).map((p) => p.getAttribute("fill"));
        expect(fills[0]).toBe("var(--color-chart-1)");
        expect(fills[1]).toMatch(/^url\(#.+-pattern-1\)$/);
        expect(fills[2]).toMatch(/^url\(#.+-pattern-2\)$/);
        // 凡例の記号も模様を持つので、グラフの SVG 内だけ数える
        expect(container.querySelectorAll("svg[role='img'] defs pattern")).toHaveLength(2);
    });

    it("percent で Y 軸が % になり、データテーブルに構成比を併記する", async () => {
        const user = userEvent.setup();
        const { container } = render(<AreaChart title="構成比" unit="件" data={data} xKey="month" series={series} percent size={size} />);
        const yTicks = Array.from(container.querySelectorAll(".recharts-yAxis-tick-labels .recharts-cartesian-axis-tick-value")).map((t) => t.textContent);
        expect(yTicks).toContain("100%");
        expect(yTicks).toContain("0%");
        await user.click(screen.getByRole("button", { name: "データテーブルを表示" }));
        expect(within(screen.getByRole("table")).getByRole("cell", { name: "600件（50%）" })).toBeInTheDocument();
    });

    it("凡例に系列名を出す", () => {
        render(<AreaChart title="推移" data={data} xKey="month" series={series} size={size} />);
        const legend = screen.getByRole("list", { name: "凡例" });
        expect(within(legend).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["オンライン", "窓口", "郵送"]);
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(
            <div>
                <AreaChart title="実数" unit="件" data={data} xKey="month" series={series} size={size} defaultTableOpen />
                <AreaChart title="100%" unit="件" data={data} xKey="month" series={series} percent size={size} />
            </div>,
        );
        await expectNoA11yViolations(container);
    });
});
