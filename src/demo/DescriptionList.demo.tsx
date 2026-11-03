import { StatusChip } from "@/components/ui/ChipLabel";
import { DescriptionItem, DescriptionList } from "@/components/ui/DescriptionList";
import type { ComponentDemo } from "./types";

const items = [
    { term: "申請番号", description: "A-2026-00123" },
    { term: "申請者", description: "鈴木 一郎" },
    { term: "種別", description: "戸籍謄本（全部事項証明書）" },
    { term: "申請日", description: "2026年10月2日" },
    { term: "状態", description: <StatusChip status="warning">審査中</StatusChip> },
];

const demo: ComponentDemo = {
    slug: "description-list",
    title: "説明リスト",
    category: "データ表示",
    description: "名前と値のペアが繰り返される情報（申請内容の確認、プロフィール、設定項目）を並べる。比較が必要ならテーブルを使う。",
    dadsUrl: "https://design.digital.go.jp/dads/components/description-list/",
    source: "@/components/ui/DescriptionList",
    examples: [
        {
            title: "基本",
            description: "モバイルでは縦積み（値は左 32px）、md 以上では名前 1 : 値 2 の横並び。",
            render: () => <DescriptionList items={items} />,
        },
        {
            title: "罫線あり（divided）",
            render: () => <DescriptionList items={items} divided />,
        },
        {
            title: "2 列（columns=2）",
            description: "項目が多い設定画面などで md 以上を 2 列にする。",
            render: () => (
                <DescriptionList columns={2} divided>
                    <DescriptionItem term="氏名">鈴木 一郎</DescriptionItem>
                    <DescriptionItem term="フリガナ">スズキ イチロウ</DescriptionItem>
                    <DescriptionItem term="生年月日">1985年4月12日</DescriptionItem>
                    <DescriptionItem term="電話番号">03-1234-5678</DescriptionItem>
                    <DescriptionItem term="住所">東京都千代田区霞が関 1-2-3</DescriptionItem>
                    <DescriptionItem term="メールアドレス">ichiro@example.go.jp</DescriptionItem>
                </DescriptionList>
            ),
        },
    ],
};

export default demo;
