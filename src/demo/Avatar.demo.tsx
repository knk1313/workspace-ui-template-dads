import { Avatar, AvatarGroup } from "@/components/ui/Avatar";
import type { ComponentDemo } from "./types";

const demo: ComponentDemo = {
    slug: "avatar",
    title: "アバター",
    category: "データ表示",
    description: "利用者や担当者を示す画像、または名前のイニシャル。role=\"img\" + aria-label に名前を持たせ、画像の読み込みに失敗したらイニシャルに戻す。",
    source: "@/components/ui/Avatar",
    examples: [
        {
            title: "イニシャル（画像なし）",
            description: "「山田 太郎」→「山太」、「Taro Yamada」→「TY」。",
            render: () => (
                <div className="flex flex-wrap items-center gap-4">
                    <Avatar name="山田 太郎" />
                    <Avatar name="Taro Yamada" />
                    <Avatar name="佐藤" />
                    <Avatar name="hanako" />
                </div>
            ),
        },
        {
            title: "サイズと形",
            description: "sm 32 / md 40 / lg 48。circle（人）と square（組織・プロジェクト）。",
            render: () => (
                <div className="flex flex-wrap items-center gap-4">
                    <Avatar name="山田 太郎" size="sm" />
                    <Avatar name="山田 太郎" size="md" />
                    <Avatar name="山田 太郎" size="lg" />
                    <Avatar name="市民課" size="sm" shape="square" />
                    <Avatar name="市民課" size="md" shape="square" />
                    <Avatar name="市民課" size="lg" shape="square" />
                </div>
            ),
        },
        {
            title: "画像（読み込み失敗時はイニシャル）",
            render: () => (
                <div className="flex flex-wrap items-center gap-4">
                    <Avatar name="山田 太郎" src="/favicon.svg" size="lg" />
                    <Avatar name="佐藤 花子" src="/not-found.png" size="lg" />
                </div>
            ),
        },
        {
            title: "AvatarGroup（重ねて表示、+n）",
            render: () => (
                <div className="flex flex-col gap-4">
                    <AvatarGroup items={[{ name: "山田 太郎" }, { name: "佐藤 花子" }, { name: "鈴木 一郎" }]} label="担当者" />
                    <AvatarGroup items={[{ name: "山田 太郎" }, { name: "佐藤 花子" }, { name: "鈴木 一郎" }, { name: "高橋 美咲" }, { name: "田中 健" }]} max={3} size="sm" label="メンバー" />
                </div>
            ),
        },
    ],
};

export default demo;
