import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { FileText } from "lucide-react";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { StatCard } from "./StatCard";

describe("StatCard", () => {
    it("sectionにラベルで名前が付き、値・単位・注記を描画する", () => {
        render(<StatCard label="今月の申請件数" value="1,234" unit="件" note="2026年10月末時点" />);
        const section = screen.getByRole("region", { name: "今月の申請件数" });
        expect(section).toBeInTheDocument();
        expect(screen.getByText("1,234")).toHaveClass("nums", "text-std-28B-150", "md:text-std-32B-150");
        expect(screen.getByText("件")).toBeInTheDocument();
        expect(screen.getByText("2026年10月末時点")).toBeInTheDocument();
    });

    it("増減はアイコン + 符号 + 色で示し、スクリーンリーダーには言葉で伝える", () => {
        const { rerender } = render(<StatCard label="A" value="10" delta={{ value: "+12.3%", trend: "up", label: "前月比" }} />);
        const up = screen.getByText("前月比12.3%増加");
        expect(up).toHaveClass("sr-only");
        expect(up.parentElement).toHaveClass("text-trend-up");
        expect(screen.getByText("+12.3%")).toHaveAttribute("aria-hidden", "true");
        expect(up.parentElement?.querySelector("svg.lucide-arrow-up")).toBeInTheDocument();

        rerender(<StatCard label="A" value="10" delta={{ value: "-5件", trend: "down", label: "前週比" }} />);
        const down = screen.getByText("前週比5件減少");
        expect(down.parentElement).toHaveClass("text-trend-down");
        expect(down.parentElement?.querySelector("svg.lucide-arrow-down")).toBeInTheDocument();

        rerender(<StatCard label="A" value="10" delta={{ value: "±0", trend: "flat", label: "前月比" }} />);
        expect(screen.getByText("前月比0横ばい")).toBeInTheDocument();
        expect(screen.getByRole("region").querySelector("svg.lucide-minus")).toBeInTheDocument();
    });

    it("highlightでキーカラーの面になり、増減の色は白のまま（アイコンと符号で伝える）", () => {
        render(<StatCard label="A" value="10" highlight delta={{ value: "+1", trend: "up" }} icon={FileText} />);
        const section = screen.getByRole("region");
        expect(section).toHaveClass("bg-surface-highlight", "text-on-highlight");
        expect(screen.getByText("1増加").parentElement).toHaveClass("text-on-highlight");
        expect(screen.getByText("1増加").parentElement).not.toHaveClass("text-trend-up");
    });

    it("hrefでラベルがリンクになり、カード全体に領域が広がる", () => {
        render(
            <MemoryRouter>
                <StatCard label="未処理の申請" value="12" href="/applications?status=pending" />
            </MemoryRouter>,
        );
        const link = screen.getByRole("link", { name: "未処理の申請" });
        expect(link).toHaveAttribute("href", "/applications?status=pending");
        expect(link).toHaveClass("after:absolute", "after:inset-0");
        expect(screen.getByRole("region", { name: "未処理の申請" })).toHaveClass("relative");
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(
            <MemoryRouter>
                <div>
                    <StatCard label="A" value="1" highlight delta={{ value: "+1%", trend: "up", label: "前月比" }} note="注" icon={FileText} />
                    <StatCard label="B" value="2" href="/b" delta={{ value: "-1%", trend: "down" }} />
                </div>
            </MemoryRouter>,
        );
        await expectNoA11yViolations(container);
    });
});
