import { Timeline } from "@/components/ui/Timeline";
import type { ComponentDemo } from "./types";

const demo: ComponentDemo = {
    slug: "timeline",
    title: "タイムライン",
    category: "データ表示",
    description: "手続きの履歴や進行状況を時系列に示す。完了 = 塗り + チェック、現在 = 枠（aria-current=\"step\"）、未着手 = 薄い枠。",
    source: "@/components/ui/Timeline",
    examples: [
        {
            title: "手続きの進行状況",
            render: () => (
                <Timeline
                    items={[
                        { id: "1", title: "受付", description: "申請を受け付けました。", date: "2026年10月1日 9:30", dateTime: "2026-10-01T09:30:00+09:00", status: "done" },
                        { id: "2", title: "書類確認", description: "添付書類の不備がないか確認しました。", date: "2026年10月2日 14:00", dateTime: "2026-10-02T14:00:00+09:00", status: "done" },
                        { id: "3", title: "審査中", description: "担当者が内容を審査しています。通常 3 営業日ほどかかります。", date: "2026年10月3日〜", dateTime: "2026-10-03", status: "current" },
                        { id: "4", title: "承認", status: "upcoming" },
                        { id: "5", title: "交付", description: "窓口または郵送で交付します。", status: "upcoming" },
                    ]}
                />
            ),
        },
        {
            title: "すべて完了",
            render: () => (
                <Timeline
                    items={[
                        { id: "1", title: "受付", date: "2026年9月1日", dateTime: "2026-09-01", status: "done" },
                        { id: "2", title: "審査", date: "2026年9月3日", dateTime: "2026-09-03", status: "done" },
                        { id: "3", title: "交付", date: "2026年9月5日", dateTime: "2026-09-05", status: "done" },
                    ]}
                />
            ),
        },
    ],
};

export default demo;
