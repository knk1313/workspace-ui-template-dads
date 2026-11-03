import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ChipTag } from "@/components/ui/ChipTag";
import type { ComponentDemo } from "./types";

const INITIAL = ["東京都", "証明書", "2026年10月", "審査中"];

function Filters() {
    const [tags, setTags] = useState(INITIAL);
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-16 text-text-muted">絞り込み条件:</span>
                {tags.map((tag) => (
                    <ChipTag key={tag} label={tag} onRemove={() => setTags((prev) => prev.filter((t) => t !== tag))} />
                ))}
                {tags.length === 0 && <span className="text-16 text-text-muted">なし</span>}
            </div>
            <Button variant="text" size="sm" onClick={() => setTags(INITIAL)}>
                条件を元に戻す
            </Button>
        </div>
    );
}

const demo: ComponentDemo = {
    slug: "chip-tag",
    title: "チップタグ",
    category: "データ表示",
    description: "ユーザーが選択・入力した値（絞り込み条件、宛先など）を並べ、個別に外せるようにする。状態や分類を示すときはチップラベルを使う。",
    dadsUrl: "https://design.digital.go.jp/dads/components/chip-tag/",
    source: "@/components/ui/ChipTag",
    examples: [
        {
            title: "絞り込み条件（削除できる）",
            description: "削除ボタンは「{label} を削除」の名前と 44px のタップ領域を持つ。削除が取り消せない場面では使わない。",
            render: () => <Filters />,
        },
        {
            title: "リンク付き・削除なし",
            description: "絞り込みページへのリンクなど、表示だけの用途。",
            render: () => (
                <div className="flex flex-wrap items-center gap-2">
                    <ChipTag label="証明書" href="/components/data-table" />
                    <ChipTag label="届出" href="/components/data-table" />
                    <ChipTag label="給付" />
                </div>
            ),
        },
        {
            title: "人物（アバター付き）",
            description: "宛先や担当者を示すときは先頭にアバターを置く。",
            render: () => (
                <div className="flex flex-wrap items-center gap-2">
                    <ChipTag label="山田 太郎" leading={<Avatar name="山田 太郎" size="sm" />} onRemove={() => {}} />
                    <ChipTag label="佐藤 花子" leading={<Avatar name="佐藤 花子" size="sm" />} onRemove={() => {}} />
                </div>
            ),
        },
    ],
};

export default demo;
