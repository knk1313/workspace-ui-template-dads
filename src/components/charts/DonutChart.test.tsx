import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { DonutChart, groupSlices } from "./DonutChart";

const data = [
    { name: "承認", value: 600 },
    { name: "審査中", value: 300 },
    { name: "差し戻し", value: 100 },
];
const size = { width: 400, height: 300 };

describe("DonutChart", () => {
    it("SVG に role=img と要約（合計・構成比）の aria-label を付け、中央に合計を出す", () => {
        render(<DonutChart title="申請の状態別構成比" unit="件" data={data} size={size} />);
        const img = screen.getByRole("img");
        expect(img.tagName).toBe("svg");
        expect(img).toHaveAttribute("aria-label", expect.stringContaining("合計 1,000件"));
        expect(img).toHaveAttribute("aria-label", expect.stringContaining("承認 600件（60%）"));
        expect(screen.getByText("1,000件")).toBeInTheDocument();
        expect(screen.getByText("合計")).toBeInTheDocument();
    });

    it("扇の数だけセクターを描き、名前と % のラベルを外側に出す", () => {
        const { container } = render(<DonutChart title="構成比" data={data} size={size} />);
        expect(container.querySelectorAll("path.recharts-sector")).toHaveLength(3);
        expect(screen.getByText("承認 60%")).toBeInTheDocument();
        expect(screen.getByText("差し戻し 10%")).toBeInTheDocument();
        const sectors = container.querySelectorAll("path.recharts-sector");
        expect(sectors[0]).toHaveAttribute("fill", "var(--color-chart-1)");
        expect(sectors[1]?.getAttribute("fill")).toMatch(/^url\(#.+-pattern-1\)$/);
    });

    it("maxSlices を超えた分を「その他」にまとめる", () => {
        const many = Array.from({ length: 7 }, (_, i) => ({ name: `項目${i + 1}`, value: 100 - i * 10 }));
        expect(groupSlices(many, 5, "その他")).toEqual([
            { name: "項目1", value: 100 },
            { name: "項目2", value: 90 },
            { name: "項目3", value: 80 },
            { name: "項目4", value: 70 },
            { name: "その他", value: 60 + 50 + 40 },
        ]);
        render(<DonutChart title="構成比" data={many} size={size} />);
        const legend = screen.getByRole("list", { name: "凡例" });
        const names = within(legend).getAllByRole("listitem").map((li) => li.textContent);
        expect(names).toHaveLength(5);
        expect(names[4]).toBe("その他");
    });

    it("データテーブルに値と構成比を出す", async () => {
        const user = userEvent.setup();
        render(<DonutChart title="申請の状態別構成比" unit="件" data={data} size={size} />);
        await user.click(screen.getByRole("button", { name: "データテーブルを表示" }));
        const table = screen.getByRole("table", { name: /申請の状態別構成比/ });
        expect(within(table).getByRole("columnheader", { name: "構成比" })).toBeInTheDocument();
        expect(within(table).getByRole("rowheader", { name: "審査中" })).toBeInTheDocument();
        expect(within(table).getByRole("cell", { name: "300件" })).toBeInTheDocument();
        expect(within(table).getByRole("cell", { name: "30%" })).toBeInTheDocument();
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(<DonutChart title="申請の状態別構成比" unit="件" data={data} source="申請管理システム" size={size} defaultTableOpen />);
        await expectNoA11yViolations(container);
    });
});
