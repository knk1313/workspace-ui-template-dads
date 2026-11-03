import { FileText, Users } from "lucide-react";
import { AvatarGroup } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ChipLabel } from "@/components/ui/ChipLabel";
import { GridList, GridListItem } from "@/components/ui/GridList";
import { Icon } from "@/components/ui/Icon";
import type { ComponentDemo } from "./types";

const services = [
    { title: "住民票の写し", description: "本人または同一世帯の方の住民票を交付します。", category: "証明書" },
    { title: "印鑑登録証明書", description: "印鑑登録証をお持ちの方に交付します。", category: "証明書" },
    { title: "転入届", description: "他の市区町村から転入したときの届出です。", category: "届出" },
    { title: "児童手当の申請", description: "中学校修了前の児童を養育している方が対象です。", category: "給付" },
];

const demo: ComponentDemo = {
    slug: "grid-list",
    title: "グリッド一覧",
    category: "データ表示",
    description: "プロジェクト、手続き、テンプレートなどをカードで並べる一覧。画面幅に応じて 1 列から最大 columns 列まで増える。",
    source: "@/components/ui/GridList",
    examples: [
        {
            title: "基本（リンク付きカード）",
            description: "タイトルだけをリンクにしてカード全体に領域を広げる。actions のボタンは擬似要素の上に乗る。",
            render: () => (
                <GridList columns={3}>
                    {services.map((s) => (
                        <GridListItem
                            key={s.title}
                            title={s.title}
                            description={s.description}
                            meta={<ChipLabel style="outlined">{s.category}</ChipLabel>}
                            leading={<Icon icon={FileText} size="lg" />}
                            href="/components/data-table"
                            actions={
                                <Button variant="outline" size="sm">
                                    申請する
                                </Button>
                            }
                        />
                    ))}
                </GridList>
            ),
        },
        {
            title: "2 列（チーム一覧）",
            render: () => (
                <GridList columns={2}>
                    <GridListItem
                        title="市民課 窓口チーム"
                        description="証明書の交付と各種届出の受付を担当します。"
                        leading={<Icon icon={Users} size="lg" />}
                        actions={<AvatarGroup items={[{ name: "山田 太郎" }, { name: "佐藤 花子" }, { name: "鈴木 一郎" }, { name: "高橋 美咲" }, { name: "田中 健" }]} size="sm" label="メンバー" />}
                    />
                    <GridListItem
                        title="審査チーム"
                        description="申請内容の審査と差戻しの判断を担当します。"
                        leading={<Icon icon={Users} size="lg" />}
                        actions={<AvatarGroup items={[{ name: "伊藤 さくら" }, { name: "渡辺 大輔" }]} size="sm" label="メンバー" />}
                    />
                </GridList>
            ),
        },
    ],
};

export default demo;
