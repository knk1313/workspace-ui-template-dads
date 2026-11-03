import { useState } from "react";
import { SearchBox } from "@/components/ui/SearchBox";
import type { ComponentDemo } from "./types";

function BasicExample() {
    const [value, setValue] = useState("");
    const [submitted, setSubmitted] = useState<string | null>(null);
    return (
        <div className="flex max-w-xl flex-col gap-4">
            <SearchBox label="サイト内検索" value={value} onChange={setValue} onSubmit={setSubmitted} onClear={() => setValue("")} />
            <p className="m-0 text-16 text-text-muted">{submitted == null ? "検索すると結果がここに表示されます" : `「${submitted}」で検索しました`}</p>
        </div>
    );
}

function SizeExample() {
    const [sm, setSm] = useState("");
    const [lg, setLg] = useState("");
    return (
        <div className="flex max-w-xl flex-col gap-6">
            <SearchBox label="Small" showLabel size="sm" value={sm} onChange={setSm} />
            <SearchBox label="Large" showLabel size="lg" value={lg} onChange={setLg} buttonLabel="検索する" />
        </div>
    );
}

const demo: ComponentDemo = {
    slug: "search-box",
    title: "検索ボックス",
    category: "フォーム",
    description: "サイト内検索などの入力欄と検索ボタン。form[role=search] で検索ランドマークになる。表の行の絞り込みにはテーブルコントロールを使う。",
    dadsUrl: "https://design.digital.go.jp/dads/components/search-box/",
    source: "@/components/ui/SearchBox",
    examples: [
        {
            title: "基本",
            description: "ラベルは視覚的に隠すが必ず付ける。onClear を渡すと入力中に消去ボタンが出る。Enter とボタンで onSubmit。",
            render: () => <BasicExample />,
        },
        {
            title: "サイズとラベル表示",
            description: "sm 40px / md 48px / lg 56px。showLabel でラベルを表示できる。",
            render: () => <SizeExample />,
        },
    ],
};

export default demo;
