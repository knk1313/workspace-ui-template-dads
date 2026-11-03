import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { BarChart } from "./BarChart";

const data = [
    { region: "北海道", online: 320, counter: 180 },
    { region: "東京都", online: 980, counter: 410 },
    { region: "大阪府", online: 640, counter: 300 },
];
const series = [
    { key: "online", name: "オンライン" },
    { key: "counter", name: "窓口" },
];
const size = { width: 600, height: 240 };

describe("BarChart", () => {
    it("SVGにrole=imgと要約のaria-labelを付ける", () => {
        render(<BarChart title="地域別の申請件数" unit="件" data={data} xKey="region" series={series} size={size} />);
        const img = screen.getByRole("img");
        expect(img.tagName).toBe("svg");
        expect(img).toHaveAttribute("aria-label", expect.stringContaining("地域別の申請件数"));
        expect(img).toHaveAttribute("aria-label", expect.stringContaining("オンラインは東京都が最大980件、北海道が最小320件"));
    });

    it("系列ごとに棒を描き、2系列目は模様で塗る", () => {
        const { container } = render(<BarChart title="件数" data={data} xKey="region" series={series} size={size} />);
        expect(container.querySelectorAll("g.recharts-bar")).toHaveLength(2);
        expect(container.querySelectorAll("path.recharts-rectangle[data-series='online']")).toHaveLength(3);
        expect(container.querySelectorAll("path.recharts-rectangle[data-series='counter']")).toHaveLength(3);
        const first = container.querySelector("path.recharts-rectangle[data-series='online']");
        const second = container.querySelector("path.recharts-rectangle[data-series='counter']");
        expect(first).toHaveAttribute("fill", "var(--color-chart-1)");
        expect(second?.getAttribute("fill")).toMatch(/^url\(#.+-pattern-1\)$/);
        expect(container.querySelector("defs pattern")).toBeInTheDocument();
    });

    it("patterns=falseなら2系列目もベタ塗り", () => {
        const { container } = render(<BarChart title="件数" data={data} xKey="region" series={series} patterns={false} size={size} />);
        const second = container.querySelector("path.recharts-rectangle[data-series='counter']");
        expect(second).toHaveAttribute("fill", "var(--color-chart-2)");
    });

    it("横棒ではカテゴリーがY軸に並ぶ", () => {
        const { container } = render(<BarChart title="件数" data={data} xKey="region" series={series} layout="horizontal" size={size} />);
        const yTicks = Array.from(container.querySelectorAll(".recharts-yAxis-tick-labels .recharts-cartesian-axis-tick-value")).map((t) => t.textContent);
        expect(yTicks).toEqual(["北海道", "東京都", "大阪府"]);
    });

    it("sortedで合計の大きい順に並べ替える（データテーブルにも反映）", async () => {
        const user = userEvent.setup();
        render(<BarChart title="件数" data={data} xKey="region" series={series} sorted size={size} />);
        await user.click(screen.getByRole("button", { name: "数値の表を表示" }));
        const rows = within(screen.getByRole("table")).getAllByRole("rowheader").map((th) => th.textContent);
        expect(rows).toEqual(["東京都", "大阪府", "北海道"]);
    });

    it("showValuesで値ラベルを描く", () => {
        render(<BarChart title="件数" unit="件" data={data} xKey="region" series={series} showValues size={size} />);
        expect(screen.getByText("980")).toBeInTheDocument();
        expect(screen.getByText("180")).toBeInTheDocument();
    });

    it("積み上げ + showValuesでは合計を描く", () => {
        render(<BarChart title="件数" data={data} xKey="region" series={series} stacked showValues size={size} />);
        expect(screen.getByText("1,390")).toBeInTheDocument();
        expect(screen.queryByText("980")).not.toBeInTheDocument();
    });

    it("参照線のラベルを描く", () => {
        render(<BarChart title="件数" data={data} xKey="region" series={series} referenceLine={{ y: 500, label: "平均500" }} size={size} />);
        expect(screen.getByText("平均500")).toBeInTheDocument();
    });

    it("凡例とデータテーブル（caption・数値の右寄せ）", async () => {
        const user = userEvent.setup();
        render(<BarChart title="地域別の申請件数" unit="件" data={data} xKey="region" series={series} xAxisLabel="地域" size={size} />);
        const legend = screen.getByRole("list", { name: "凡例" });
        expect(within(legend).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["オンライン", "窓口"]);
        await user.click(screen.getByRole("button", { name: "数値の表を表示" }));
        const table = screen.getByRole("table", { name: /地域別の申請件数/ });
        expect(within(table).getByRole("columnheader", { name: "地域" })).toBeInTheDocument();
        const cell = within(table).getByRole("cell", { name: "980件" });
        expect(cell).toHaveClass("text-right", "nums");
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(
            <div>
                <BarChart title="縦棒" unit="件" data={data} xKey="region" series={series} showValues size={size} />
                <BarChart title="横棒（積み上げ）" data={data} xKey="region" series={series} layout="horizontal" stacked size={size} defaultTableOpen />
            </div>,
        );
        await expectNoA11yViolations(container);
    });
});
