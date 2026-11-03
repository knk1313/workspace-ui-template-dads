import { useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { Radio } from "@/components/ui/Radio";
import { RadioGroup } from "@/components/ui/RadioGroup";
import type { ComponentDemo } from "./types";

const CONTACT = [
    { value: "email", label: "メール" },
    { value: "sms", label: "SMS" },
    { value: "post", label: "郵送" },
    { value: "none", label: "連絡を希望しない" },
];

function ControlledExample() {
    const [value, setValue] = useState("email");
    return (
        <div className="flex flex-col gap-4">
            <FormField label="連絡方法" as="fieldset" requirement="required" supportText="審査結果の連絡に使います">
                <RadioGroup name="contact" value={value} onChange={setValue} options={CONTACT} />
            </FormField>
            <p className="m-0 text-16 text-text-muted">選択中: {value}</p>
        </div>
    );
}

const demo: ComponentDemo = {
    slug: "radio",
    title: "ラジオボタン",
    category: "フォーム",
    description: "複数の選択肢から 1 つだけ選ぶ。選択解除できないため、任意項目には「該当なし」のような選択肢を用意する。",
    dadsUrl: "https://design.digital.go.jp/dads/components/radio/",
    source: "@/components/ui/Radio, @/components/ui/RadioGroup, @/components/ui/FormField",
    examples: [
        {
            title: "基本（RadioGroup + FormField as=\"fieldset\"）",
            description: "項目ラベルが legend になり、サポートテキストはグループに関連付く。矢印キーで選択を移動できる。",
            render: () => <ControlledExample />,
        },
        {
            title: "エラー",
            description: "すべてのラジオボタンがエラー色になり、エラーテキストをグループの下に置く。",
            render: () => (
                <FormField label="受け取り方法" as="fieldset" requirement="required" errorText="受け取り方法を選択してください">
                    <RadioGroup
                        name="delivery"
                        options={[
                            { value: "window", label: "窓口で受け取る" },
                            { value: "mail", label: "郵送で受け取る" },
                        ]}
                    />
                </FormField>
            ),
        },
        {
            title: "横並び",
            description: "選択肢が短く少ないときだけ横に並べる。",
            render: () => (
                <FormField label="回答" as="fieldset">
                    <RadioGroup
                        name="answer"
                        direction="horizontal"
                        defaultValue="yes"
                        options={[
                            { value: "yes", label: "はい" },
                            { value: "no", label: "いいえ" },
                        ]}
                    />
                </FormField>
            ),
        },
        {
            title: "サイズ",
            description: "sm 24px / md 32px / lg 44px。ラベル付きは上下の余白で 44px のタップ領域を確保する。",
            render: () => (
                <div className="flex flex-wrap items-start gap-6">
                    <Radio name="size" value="sm" size="sm" defaultChecked>
                        Small
                    </Radio>
                    <Radio name="size" value="md" size="md">
                        Medium
                    </Radio>
                    <Radio name="size" value="lg" size="lg">
                        Large
                    </Radio>
                </div>
            ),
        },
        {
            title: "選択不可の選択肢",
            description: "disabled は原則使わない。使う場合は理由をラベルに書く。",
            render: () => (
                <FormField label="支払方法" as="fieldset">
                    <RadioGroup
                        name="payment"
                        options={[
                            { value: "bank", label: "銀行振込" },
                            { value: "card", label: "クレジットカード" },
                            { value: "cash", label: "窓口での現金払い（現在受付停止中）", disabled: true },
                        ]}
                    />
                </FormField>
            ),
        },
    ],
};

export default demo;
