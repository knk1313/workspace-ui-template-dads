import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { Timeline, type TimelineItem } from "./Timeline";

const items: TimelineItem[] = [
    { id: "1", title: "受付", description: "申請を受け付けました", date: "2026年10月1日", dateTime: "2026-10-01", status: "done" },
    { id: "2", title: "審査中", description: "担当者が内容を確認しています", date: "2026年10月3日", dateTime: "2026-10-03", status: "current" },
    { id: "3", title: "承認", status: "upcoming" },
    { id: "4", title: "完了", status: "upcoming" },
];

describe("Timeline", () => {
    it("ol / li で描画し、タイトル・説明・日付を表示する", () => {
        render(<Timeline items={items} />);
        expect(screen.getByRole("list").tagName).toBe("OL");
        const entries = screen.getAllByRole("listitem");
        expect(entries).toHaveLength(4);
        expect(screen.getByText("申請を受け付けました")).toBeInTheDocument();
        const time = entries[0].querySelector("time");
        expect(time).toHaveAttribute("datetime", "2026-10-01");
        expect(time).toHaveTextContent("2026年10月1日");
    });

    it("status に応じたマーカーと aria-current、スクリーンリーダー向けの状態テキスト", () => {
        render(<Timeline items={items} />);
        const entries = screen.getAllByRole("listitem");
        // done: 塗り + チェック
        const doneMarker = entries[0].querySelector("[aria-hidden='true'].rounded-full");
        expect(doneMarker).toHaveClass("bg-primary");
        expect(doneMarker?.querySelector("svg.lucide-check")).toBeInTheDocument();
        expect(entries[0]).toHaveTextContent("（完了）");
        expect(entries[0]).not.toHaveAttribute("aria-current");
        // current: 枠 + aria-current="step"
        expect(entries[1]).toHaveAttribute("aria-current", "step");
        const currentMarker = entries[1].querySelector("[aria-hidden='true'].rounded-full");
        expect(currentMarker).toHaveClass("border-primary", "bg-surface");
        expect(entries[1]).toHaveTextContent("（現在）");
        // upcoming: 薄い枠 + 文字は控えめ
        const upcomingMarker = entries[2].querySelector("[aria-hidden='true'].rounded-full");
        expect(upcomingMarker).toHaveClass("border-border");
        expect(entries[2]).toHaveTextContent("（未着手）");
        // 縦線は最後の項目にはない
        expect(entries[3].querySelector("[aria-hidden='true'].absolute")).not.toBeInTheDocument();
        expect(entries[0].querySelector("[aria-hidden='true'].absolute")).toHaveClass("bg-primary");
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(<Timeline items={items} />);
        await expectNoA11yViolations(container);
    });
});
