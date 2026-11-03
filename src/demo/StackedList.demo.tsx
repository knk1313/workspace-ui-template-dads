import { Avatar } from "@/components/ui/Avatar";
import { StatusChip } from "@/components/ui/ChipLabel";
import { StackedList, StackedListItem } from "@/components/ui/StackedList";
import type { ComponentDemo } from "./types";

const demo: ComponentDemo = {
    slug: "stacked-list",
    title: "縦積みリスト",
    category: "データ表示",
    description: "申請・通知・メンバーなど、タイトル・説明・メタ情報を持つ項目を縦に並べる。行全体をリンクにするときはタイトルだけをリンクにして領域を広げる。",
    source: "@/components/ui/StackedList",
    examples: [
        {
            title: "基本（リンク付き）",
            description: "タイトルがリンクになり、行全体がクリック領域になる。右端にシェブロンを出す。",
            render: () => (
                <StackedList className="rounded-8 border border-border bg-surface">
                    <StackedListItem title="住民票の写しの交付申請" description="山田 太郎 ・ A-2026-00121" meta={<StatusChip status="info">受付</StatusChip>} href="/components/data-table" />
                    <StackedListItem title="印鑑登録証明書の交付申請" description="佐藤 花子 ・ A-2026-00122" meta={<StatusChip status="warning">審査中</StatusChip>} href="/components/data-table" />
                    <StackedListItem title="戸籍謄本の交付申請" description="鈴木 一郎 ・ A-2026-00123" meta={<StatusChip status="success">完了</StatusChip>} href="/components/data-table" />
                </StackedList>
            ),
        },
        {
            title: "アバター付き（メンバー一覧）",
            render: () => (
                <StackedList className="rounded-8 border border-border bg-surface">
                    <StackedListItem leading={<Avatar name="山田 太郎" />} title="山田 太郎" description="総務部 ・ 管理者" meta="最終ログイン: 今日" />
                    <StackedListItem leading={<Avatar name="佐藤 花子" />} title="佐藤 花子" description="市民課 ・ 審査担当" meta="最終ログイン: 昨日" />
                    <StackedListItem leading={<Avatar name="鈴木 一郎" />} title="鈴木 一郎" description="市民課 ・ 閲覧のみ" meta="最終ログイン: 3 日前" />
                </StackedList>
            ),
        },
        {
            title: "ボタン（onClick）",
            description: "ドロワーで詳細を開くなど、ページ遷移しない操作はボタンにする。",
            render: () => (
                <StackedList className="rounded-8 border border-border bg-surface">
                    <StackedListItem title="システムメンテナンスのお知らせ" description="11月15日 2:00〜5:00 にサービスを停止します" meta="10月28日" onClick={() => {}} />
                    <StackedListItem title="新しい様式の提供開始" description="転入届の様式を更新しました" meta="10月20日" onClick={() => {}} />
                </StackedList>
            ),
        },
    ],
};

export default demo;
