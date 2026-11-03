import { useState } from "react";
import { Combobox } from "@/components/ui/Combobox";
import { FormField } from "@/components/ui/FormField";
import type { ComponentDemo } from "./types";

const WARDS = [
    "千代田区",
    "中央区",
    "港区",
    "新宿区",
    "文京区",
    "台東区",
    "墨田区",
    "江東区",
    "品川区",
    "目黒区",
    "大田区",
    "世田谷区",
    "渋谷区",
    "中野区",
    "杉並区",
    "豊島区",
    "北区",
    "荒川区",
    "板橋区",
    "練馬区",
    "足立区",
    "葛飾区",
    "江戸川区",
].map((label, i) => ({ value: String(13101 + i), label }));

const ORGANIZATIONS = [
    { value: "digital", label: "デジタル庁" },
    { value: "mic", label: "総務省" },
    { value: "mof", label: "財務省" },
    { value: "mhlw", label: "厚生労働省" },
    { value: "meti", label: "経済産業省" },
    { value: "mlit", label: "国土交通省" },
];

function BasicExample() {
    const [value, setValue] = useState("");
    return (
        <div className="flex flex-col gap-4">
            <FormField label="市区町村" requirement="required" supportText="文字を入力すると候補を絞り込めます。例: 千代田">
                <Combobox options={WARDS} value={value} onChange={setValue} name="city" />
            </FormField>
            <p className="m-0 text-16 text-text-muted">選択中の値: {value || "（未選択）"}</p>
        </div>
    );
}

function ErrorExample() {
    const [value, setValue] = useState("");
    return (
        <FormField label="所管府省庁" requirement="required" errorText="所管府省庁を選択してください">
            <Combobox options={ORGANIZATIONS} value={value} onChange={setValue} />
        </FormField>
    );
}

function SizeExample() {
    const [sm, setSm] = useState("mic");
    const [lg, setLg] = useState("");
    return (
        <div className="flex flex-col gap-6">
            <FormField label="Small（選択済み）" size="sm">
                <Combobox options={ORGANIZATIONS} value={sm} onChange={setSm} block={false} className="w-80" />
            </FormField>
            <FormField label="Large" size="lg">
                <Combobox options={ORGANIZATIONS} value={lg} onChange={setLg} />
            </FormField>
        </div>
    );
}

const demo: ComponentDemo = {
    slug: "combobox",
    title: "コンボボックス",
    category: "フォーム",
    description: "多くの選択肢を文字入力で絞り込んで 1 つ選ぶ（選択支援タイプ）。選択肢が少なければセレクトボックスを使う。",
    dadsUrl: "https://design.digital.go.jp/dads/components/combobox/",
    source: "@/components/ui/Combobox, @/components/ui/FormField",
    examples: [
        {
            title: "基本",
            description: "入力で絞り込み、↓↑ で候補を移動、Enter で確定、Esc で閉じる。候補にない文字列は確定できない。",
            render: () => <BasicExample />,
        },
        {
            title: "エラー",
            render: () => <ErrorExample />,
        },
        {
            title: "サイズと幅",
            description: "sm 40px / md 48px / lg 56px。block={false} と className で幅を指定できる。",
            render: () => <SizeExample />,
        },
    ],
};

export default demo;
