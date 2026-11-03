import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import type { ComponentDemo } from "./types";

const demo: ComponentDemo = {
    slug: "page-header",
    title: "ページ見出し",
    category: "レイアウト",
    description: "パンくず・ページタイトル（h1）・説明・メタ情報・操作をまとめたページ上部の領域。操作はモバイルでは下に回り込む。",
    source: "@/components/ui/PageHeader",
    examples: [
        {
            title: "すべての要素",
            render: () => (
                <PageHeader
                    title="申請一覧"
                    breadcrumbLabel="パンくずリスト（デモ）"
                    description="受け付けた申請の確認と審査を行います。"
                    meta="最終更新: 2026 年 11 月 3 日 10:00"
                    breadcrumbs={[
                        { label: "ホーム", href: "/" },
                        { label: "コンポーネント", href: "/components" },
                        { label: "申請一覧" },
                    ]}
                    actions={
                        <>
                            <Button variant="outline" leadIcon={Download}>
                                CSV 出力
                            </Button>
                            <Button leadIcon={Plus}>新規作成</Button>
                        </>
                    }
                />
            ),
        },
        {
            title: "タイトルだけ",
            render: () => <PageHeader title="設定" />,
        },
    ],
};

export default demo;
