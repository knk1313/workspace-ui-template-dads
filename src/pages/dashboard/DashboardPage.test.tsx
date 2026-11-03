import { screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { renderLoaded } from "@/test/renderApp";

// jsdom は要素の大きさを 0 にするため、Recharts の ResponsiveContainer がグラフを描かない。
// グラフの SVG（role="img"）を検査できるよう、要素の寸法だけ固定値にする。
beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: 600,
        bottom: 256,
        width: 600,
        height: 256,
        toJSON: () => ({}),
    });
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe("DashboardPage", () => {
    it("h1 と期間・データの更新時点を表示する", async () => {
        await renderLoaded("/");
        expect(screen.getByRole("heading", { level: 1, name: "ダッシュボード" })).toBeInTheDocument();
        expect(screen.getByText(/対象期間: 今月/)).toBeInTheDocument();
        expect(screen.getByText(/2026年11月1日 9:00 時点/)).toBeInTheDocument();
    });

    it("期間を切り替えると見出しの期間表示が変わる", async () => {
        const { user } = await renderLoaded("/");
        await user.selectOptions(screen.getByLabelText("表示期間"), "lastMonth");
        expect(screen.getByText(/対象期間: 先月（2026年9月1日〜9月30日）/)).toBeInTheDocument();
    });

    it("CSV のダウンロードはサンプルである旨をトーストで知らせる", async () => {
        const { user } = await renderLoaded("/");
        await user.click(screen.getByRole("button", { name: "CSV をダウンロード" }));
        expect(await screen.findByText(/サンプルのため/)).toBeInTheDocument();
    });

    it("KPI を 4 件表示し、左上の 1 件目だけを強調する", async () => {
        await renderLoaded("/");
        const kpi = screen.getByRole("region", { name: "主な指標" });
        const cards = within(kpi).getAllByRole("region");
        expect(cards).toHaveLength(4);
        expect(cards[0]).toHaveAccessibleName("今月の受付件数");
        expect(cards[0]).toHaveClass("bg-surface-highlight");
        cards.slice(1).forEach((card) => expect(card).not.toHaveClass("bg-surface-highlight"));
        expect(within(cards[0]).getByText("前月比 8.2% 増加")).toBeInTheDocument();
    });

    it("グラフは role=img と要約の aria-label を持つ", async () => {
        await renderLoaded("/");
        const charts = screen.getAllByRole("img").filter((el) => el.tagName.toLowerCase() === "svg");
        expect(charts).toHaveLength(3);
        for (const title of ["受付件数の月次推移", "種別ごとの受付件数（今月）", "受付経路の構成比（今月）"]) {
            expect(charts.some((c) => c.getAttribute("aria-label")?.includes(title))).toBe(true);
            expect(screen.getByRole("heading", { level: 2, name: new RegExp(title.replace(/[()（）]/g, ".")) })).toBeInTheDocument();
        }
    });

    it("データテーブルを表示に切り替えると同じデータの表が出る", async () => {
        const { user } = await renderLoaded("/");
        const figure = screen.getByRole("heading", { level: 2, name: /受付件数の月次推移/ }).closest("figure");
        expect(figure).not.toBeNull();
        const toggle = within(figure as HTMLElement).getByRole("button", { name: "データテーブルを表示" });
        await user.click(toggle);
        expect(toggle).toHaveAttribute("aria-expanded", "true");
        const table = within(figure as HTMLElement).getByRole("table", { name: /受付件数の月次推移/ });
        expect(within(table).getByRole("rowheader", { name: "10月" })).toBeInTheDocument();
        expect(within(table).getByText("1,284件")).toBeInTheDocument();
    });

    it("最近の申請は更新日の新しい順で、受付番号が詳細画面へのリンクになる", async () => {
        await renderLoaded("/");
        const section = screen.getByRole("region", { name: "最近の申請" });
        const rows = within(section).getAllByRole("row").slice(1);
        expect(rows.length).toBeGreaterThanOrEqual(5);
        expect(rows.length).toBeLessThanOrEqual(8);
        const links = within(section).getAllByRole("link").filter((a) => /^R08-/.test(a.textContent ?? ""));
        expect(links).toHaveLength(rows.length);
        links.forEach((a) => expect(a.getAttribute("href")).toMatch(/^\/applications\/app-\d{3}$/));
        const times = within(section)
            .getAllByRole("rowheader")
            .map((th) => th.closest("tr")?.querySelector("time")?.getAttribute("datetime") ?? "");
        expect([...times].sort().reverse()).toEqual(times);
        expect(within(section).getByRole("link", { name: "申請一覧へ" })).toHaveAttribute("href", "/applications");
    });

    it("最近のアクティビティを表示する", async () => {
        await renderLoaded("/");
        const section = screen.getByRole("region", { name: "最近のアクティビティ" });
        expect(within(section).getAllByRole("listitem").length).toBeGreaterThan(0);
        expect(within(section).getByRole("link", { name: /R08-001012/ })).toHaveAttribute("href", "/applications/app-005");
    });

    it("axe の違反がない", async () => {
        const { container } = await renderLoaded("/");
        await expectNoA11yViolations(container);
    });
});
