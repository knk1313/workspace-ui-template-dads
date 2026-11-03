import { Inbox, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ComponentDemo } from "./types";

const demo: ComponentDemo = {
    slug: "empty-state",
    title: "空状態",
    category: "フィードバック",
    description: "一覧に項目がない・検索結果がないときの案内。何が起きているかと次の行動を示す。",
    source: "@/components/ui/EmptyState",
    examples: [
        {
            title: "項目がない",
            render: () => (
                <EmptyState
                    icon={Inbox}
                    as="h3"
                    title="書類がありません"
                    description="「新規作成」から最初の書類を登録してください。"
                    action={<Button leadIcon={Plus}>新規作成</Button>}
                />
            ),
        },
        {
            title: "検索結果がない",
            render: () => (
                <EmptyState
                    icon={Search}
                    as="h3"
                    title="該当する書類が見つかりません"
                    description="キーワードを変えるか、絞り込み条件を解除してください。"
                    action={<Button variant="outline">条件を解除する</Button>}
                />
            ),
        },
    ],
};

export default demo;
