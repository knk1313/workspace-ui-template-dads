import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { NotificationBanner } from "@/components/ui/NotificationBanner";
import type { ComponentDemo } from "./types";

function Dismissible() {
    const [open, setOpen] = useState(true);
    if (!open) {
        return (
            <Button variant="text" onClick={() => setOpen(true)}>
                お知らせを再表示する
            </Button>
        );
    }
    return (
        <NotificationBanner
            type="info"
            title="システムメンテナンスのお知らせ"
            date="2026年4月1日"
            dateTime="2026-04-01"
            description="4 月 5 日（日）2:00〜5:00 はメンテナンスのためご利用いただけません。"
            onClose={() => setOpen(false)}
        />
    );
}

const demo: ComponentDemo = {
    slug: "notification-banner",
    title: "ノティフィケーションバナー",
    category: "フィードバック",
    description: "ページや要素に関わる重要度の高い情報を、サービス側から利用者へ提示する。アイコンとタイトルは必須。",
    dadsUrl: "https://design.digital.go.jp/dads/components/notification-banner/",
    source: "@/components/ui/NotificationBanner",
    examples: [
        {
            title: "タイプ",
            description: "success / error / warning / info（情報提示 1 = プライマリー色）/ neutral（情報提示 2 = グレー）。色だけでなくアイコンとタイトルで意味を伝える。",
            render: () => (
                <div className="flex flex-col gap-4">
                    <NotificationBanner type="success" title="申請を受け付けました" as="h3" />
                    <NotificationBanner type="error" title="入力内容にエラーがあります" as="h3" description="3 件の項目を修正してください。" />
                    <NotificationBanner type="warning" title="有効期限が近づいています" as="h3" description="証明書の有効期限は 2026 年 4 月 30 日です。" />
                    <NotificationBanner type="info" title="新しい機能を追加しました" as="h3" />
                    <NotificationBanner type="neutral" title="重要なお知らせ" as="h3" />
                </div>
            ),
        },
        {
            title: "カラーチップスタイル",
            description: "枠 2px + 左端の帯。サービス内ではどちらかのスタイルに統一する。",
            render: () => (
                <div className="flex flex-col gap-4">
                    <NotificationBanner style="color-chip" type="success" title="保存しました" as="h3" />
                    <NotificationBanner style="color-chip" type="warning" title="未保存の変更があります" as="h3" />
                    <NotificationBanner style="color-chip" type="error" title="送信できませんでした" as="h3" />
                </div>
            ),
        },
        {
            title: "閉じるボタンと年月日",
            description: "閉じた状態はサービス側で記憶し、利用者が再表示できるようにする。モバイルでは閉じるボタンはアイコンのみ。",
            render: () => <Dismissible />,
        },
        {
            title: "アクションボタン",
            description: "選択的な行動を促すときはプライマリーとセカンダリーを使う。アクションで「閉じる」を作らない。",
            render: () => (
                <NotificationBanner
                    type="warning"
                    title="パスワードの変更をお願いします"
                    as="h3"
                    description="最後の変更から 180 日が経過しています。"
                    actions={
                        <>
                            <Button variant="outline">後で変更する</Button>
                            <Button>今すぐ変更する</Button>
                        </>
                    }
                />
            ),
        },
    ],
};

export default demo;
