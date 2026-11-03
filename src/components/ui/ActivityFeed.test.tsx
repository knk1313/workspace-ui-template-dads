import { render, screen } from "@testing-library/react";
import { FileCheck } from "lucide-react";
import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "@/test/axe";
import { ActivityFeed, formatDateTime, type ActivityItem } from "./ActivityFeed";

const items: ActivityItem[] = [
    { id: "1", actor: "山田 太郎", action: "承認しました", target: "申請 #1234", time: "2026-10-01T09:30:00+09:00", timeLabel: "3分前", icon: FileCheck },
    { id: "2", actor: "佐藤 花子", action: "コメントしました", target: "申請 #1234", time: "2026-09-30T18:00:00+09:00", description: "添付書類を確認しました。" },
    { id: "3", actor: "システム", action: "ログインを記録しました", time: "2026-09-30T08:00:00+09:00" },
];

describe("ActivityFeed", () => {
    it("ol / liで描画し、「誰が何をどうした」と時刻を表示する", () => {
        render(<ActivityFeed items={items} />);
        expect(screen.getByRole("list").tagName).toBe("OL");
        const entries = screen.getAllByRole("listitem");
        expect(entries).toHaveLength(3);
        expect(entries[0]).toHaveTextContent("山田 太郎が申請 #1234を承認しました");
        expect(entries[2]).toHaveTextContent("システムがログインを記録しました");
        expect(screen.getByText("添付書類を確認しました。")).toBeInTheDocument();
    });

    it("time要素にdateTimeを持ち、timeLabelか整形した日時を表示する", () => {
        render(<ActivityFeed items={items} />);
        const times = screen.getAllByRole("listitem").map((li) => li.querySelector("time")!);
        expect(times[0]).toHaveAttribute("datetime", "2026-10-01T09:30:00+09:00");
        expect(times[0]).toHaveTextContent("3分前");
        expect(times[1]).toHaveTextContent(formatDateTime("2026-09-30T18:00:00+09:00"));
        expect(formatDateTime("2026-09-30T18:00:00+09:00")).toMatch(/2026年9月30日/);
        expect(formatDateTime("not-a-date")).toBe("not-a-date");
    });

    it("項目をつなぐ縦線は最後の項目にはなく、装飾として隠す", () => {
        render(<ActivityFeed items={items} />);
        const entries = screen.getAllByRole("listitem");
        expect(entries[0].querySelector("[aria-hidden='true'].bg-border")).toBeInTheDocument();
        expect(entries[2].querySelector("[aria-hidden='true'].bg-border")).not.toBeInTheDocument();
        // アイコンは装飾
        expect(entries[0].querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    });

    it("avatarを渡すとアイコンの代わりに表示する", () => {
        render(<ActivityFeed items={[{ ...items[0], avatar: <span data-testid="avatar">山</span> }]} />);
        expect(screen.getByTestId("avatar")).toBeInTheDocument();
        expect(screen.getByRole("listitem").querySelector("svg")).not.toBeInTheDocument();
    });

    it("アクセシビリティ違反がない", async () => {
        const { container } = render(<ActivityFeed items={items} />);
        await expectNoA11yViolations(container);
    });
});
