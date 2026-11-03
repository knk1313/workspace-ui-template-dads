import { FileCheck, LogIn, MessageSquare, Undo2 } from "lucide-react";
import { ActivityFeed } from "@/components/ui/ActivityFeed";
import { Avatar } from "@/components/ui/Avatar";
import { Link } from "@/components/ui/Link";
import type { ComponentDemo } from "./types";

const target = <Link to="/components/data-table">申請 A-2026-00123</Link>;

const demo: ComponentDemo = {
    slug: "activity-feed",
    title: "アクティビティフィード",
    category: "データ表示",
    description: "「誰が」「何を」「どうした」「いつ」を新しい順に並べる（監査ログ、申請の履歴）。時刻は time 要素で機械可読にする。",
    source: "@/components/ui/ActivityFeed",
    examples: [
        {
            title: "基本（アイコン）",
            render: () => (
                <ActivityFeed
                    items={[
                        { id: "1", actor: "山田 太郎", action: "承認しました", target, time: "2026-11-03T09:30:00+09:00", timeLabel: "3 分前", icon: FileCheck },
                        { id: "2", actor: "佐藤 花子", action: "コメントしました", target, time: "2026-11-02T18:00:00+09:00", icon: MessageSquare, description: "添付書類の住所が申請内容と一致しているか確認しました。問題ありません。" },
                        { id: "3", actor: "佐藤 花子", action: "差し戻しました", target, time: "2026-11-01T11:15:00+09:00", icon: Undo2 },
                        { id: "4", actor: "鈴木 一郎", action: "ログインしました", time: "2026-11-01T08:00:00+09:00", icon: LogIn },
                    ]}
                />
            ),
        },
        {
            title: "アバター付き",
            render: () => (
                <ActivityFeed
                    items={[
                        { id: "1", actor: "山田 太郎", action: "承認しました", target: "申請 A-2026-00124", time: "2026-11-03T10:00:00+09:00", timeLabel: "たった今", avatar: <Avatar name="山田 太郎" size="sm" /> },
                        { id: "2", actor: "高橋 美咲", action: "担当者を変更しました", target: "申請 A-2026-00124", time: "2026-11-02T15:40:00+09:00", avatar: <Avatar name="高橋 美咲" size="sm" /> },
                    ]}
                />
            ),
        },
    ],
};

export default demo;
